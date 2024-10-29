from datetime import datetime
from io import BytesIO
import json
import os
import logging
from matplotlib import pyplot as plt
import numpy as np
import pandas as pd
from tensorflow.keras.preprocessing import image as keras_image
import tensorflow as tf
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import GlobalAveragePooling2D, GlobalMaxPooling2D, Dense, Add, Multiply, Reshape, Lambda, Concatenate, Conv2D, Activation
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from passlib.context import CryptContext

from backend.app.models import Test

# Set up logging
logger = logging.getLogger("helpers")

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Initialize model and class indices as global variables
model = None
class_indices = {}

# ----------------------------------------
# Utility Functions for Password Hashing
# ----------------------------------------

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ----------------------------------------
# Custom Model Layer: CBAM Block Definition
# ----------------------------------------

def cbam_block(input_tensor, ratio=8):
    """
    Implements the Convolutional Block Attention Module (CBAM) block 
    for better feature refinement using both channel and spatial attention.
    """
    # Channel Attention
    channel_avg_pool = GlobalAveragePooling2D()(input_tensor)
    channel_max_pool = GlobalMaxPooling2D()(input_tensor)
    
    shared_dense_one = Dense(input_tensor.shape[-1] // ratio, activation='relu', kernel_initializer='he_normal', use_bias=True)
    shared_dense_two = Dense(input_tensor.shape[-1], activation='sigmoid', kernel_initializer='he_normal', use_bias=True)

    avg_out = shared_dense_one(channel_avg_pool)
    avg_out = shared_dense_two(avg_out)
    max_out = shared_dense_one(channel_max_pool)
    max_out = shared_dense_two(max_out)

    channel_attention = Add()([avg_out, max_out])
    channel_attention = Activation('sigmoid')(channel_attention)
    channel_attention = Reshape((1, 1, input_tensor.shape[-1]))(channel_attention)
    channel_refined = Multiply()([input_tensor, channel_attention])

    # Spatial Attention
    avg_pool = Lambda(lambda x: tf.reduce_mean(x, axis=-1, keepdims=True))(channel_refined)
    max_pool = Lambda(lambda x: tf.reduce_max(x, axis=-1, keepdims=True))(channel_refined)
    concat = Concatenate(axis=-1)([avg_pool, max_pool])
    
    spatial_attention = Conv2D(1, kernel_size=7, padding='same', activation='sigmoid', kernel_initializer='he_normal', use_bias=False)(concat)
    spatial_refined = Multiply()([channel_refined, spatial_attention])

    return spatial_refined

# ----------------------------------------
# Model Loading and Preprocessing Functions
# ----------------------------------------

def allowed_file(filename: str) -> bool:
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_model_and_class_dict():
    global model, class_indices
    base_path = os.path.dirname(__file__)
    model_path = os.path.join(base_path, 'model', 'XRayClassifier-CBAM-EfficientNetB0-99.61.h5')
    class_dict_path = os.path.join(base_path, 'model', 'XRayClassifier-CBAM-EfficientNetB0-class_dict.csv')

    try:
        model = load_model(model_path, custom_objects={'cbam_block': cbam_block})
        logger.info("Model loaded successfully.")
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise RuntimeError(f"Error loading model: {e}")

    try:
        class_dict = pd.read_csv(class_dict_path)
        class_indices = dict(zip(class_dict['class_index'], class_dict['class']))
        logger.info("Class dictionary loaded successfully.")
    except Exception as e:
        logger.error(f"Error loading class dictionary: {e}")
        raise RuntimeError(f"Error loading class dictionary: {e}")

def preprocess_image(img_path: str) -> np.ndarray:
    try:
        img = keras_image.load_img(img_path, target_size=(224, 224))
        img_array = keras_image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)
        return img_array
    except Exception as e:
        logger.error(f"Error processing image {img_path}: {e}")
        raise RuntimeError(f"Error processing image {img_path}")

def make_prediction(processed_image: np.ndarray):
    global model
    try:
        prediction = model.predict(processed_image)
        all_predictions = [(class_indices[i], prediction[0][i]) for i in range(len(class_indices))]
        logger.info(f"All predictions: {all_predictions}")
        return all_predictions
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise RuntimeError("Prediction failed")

# ----------------------------------------
# Store New Test Function
# ----------------------------------------

def store_new_test(db, user, patient, image, image_path):
    """
    Handles the process of storing a new test including image saving,
    preprocessing, prediction, and saving to the database.
    """
    try:
        # Preprocess image for prediction
        processed_image = preprocess_image(image_path)

        # Make predictions
        predictions = make_prediction(processed_image)

        # Store the test result in the database (Top prediction stored)
        top_prediction = max(predictions, key=lambda x: x[1])  # Get the prediction with the highest confidence
        new_test = Test(
            patient_id=patient.id,
            user_id=user.id,
            image_path=image_path,
            result=top_prediction[0],  
            confidence=top_prediction[1],  
            predictions=predictions, 
            date_conducted=datetime.utcnow(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(new_test)
        db.commit()
        logger.info(f"New test stored for patient ID {patient.id}")

        return {
            "message": "Test created successfully",
            "patient_id": patient.id,
            "test_id": new_test.id,
            "result": top_prediction[0],
            "confidence": top_prediction[1],
            "all_predictions": predictions
        }
    except Exception as e:
        logger.error(f"Error in storing new test: {e}")
        raise RuntimeError(f"Error in storing new test: {e}")

# ----------------------------------------
# Visualization and PDF Report Generation
# ----------------------------------------

def visualize_prediction(img_path, predictions):
    """
    Creates a visualization of all class predictions and saves it as an image.
    Returns a BytesIO buffer containing the image data for inclusion in the PDF.
    
    Args:
        img_path (str): Path to the X-ray image.
        predictions (list): List of tuples containing class labels and confidence scores.
    """
    buffer = BytesIO()

    try:
        # Load the image
        img = keras_image.load_img(img_path, target_size=(224, 224))
        img_array = keras_image.img_to_array(img)

        # Sort the predictions from highest to lowest confidence
        predictions = sorted(predictions, key=lambda x: x[1], reverse=True)

        # Find the class with the highest confidence
        top_class, top_confidence = predictions[0]

        # Create the figure and axes
        plt.imshow(np.squeeze(img_array).astype(np.uint8))
        plt.axis('on')  # Keep axis for positioning text

        # Set the title with the highest confidence class
        plt.title(f"Predicted: {top_class} ({top_confidence * 100:.2f}%)")

        # Overlay all predictions with their confidence scores (sorted from higher to lower)
        for i, (label, confidence) in enumerate(predictions):
            plt.text(10, (i + 1) * 25, f"{label}: {confidence * 100:.2f}%", 
                     fontsize=12, color='white', bbox=dict(facecolor='blue', alpha=0.7))

        # Save the plot to a BytesIO buffer
        plt.savefig(buffer, format='png')
        plt.close()
        buffer.seek(0)  # Rewind the buffer for reading
        return buffer
    except Exception as e:
        print(f"Error creating prediction visualization: {e}")
        return None



def generate_pdf_report(test, prediction_image):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=60, bottomMargin=30)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=26, textColor=colors.HexColor("#0C4DA2"), alignment=TA_CENTER, spaceAfter=20)
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Heading2'], fontSize=18, textColor=colors.HexColor("#0C4DA2"), spaceAfter=14)
    body_style = ParagraphStyle('Body', parent=styles['BodyText'], fontSize=12, textColor=colors.HexColor("#555555"), spaceAfter=10)

    story = []

    # Title and patient details
    story.append(Paragraph("Lung Disease Diagnostic Report", title_style))
    story.append(Spacer(1, 12))

    patient_details = [
        ["Patient Name", test.patient.name],
        ["Date of Birth", test.patient.date_of_birth.strftime('%Y-%m-%d')],
        ["Gender", test.patient.gender],
        ["Address", test.patient.address or "N/A"],
        ["Phone", test.patient.phone or "N/A"]
    ]
    table_style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E0E0E0")),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#000000")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#F9F9F9")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ])
    patient_table = Table(patient_details, colWidths=[150, 350])
    patient_table.setStyle(table_style)

    story.append(patient_table)
    story.append(Spacer(1, 20))

    # Test results
    story.append(Paragraph("Test Details", subtitle_style))
    test_details = [
        ["Test ID", str(test.id)],
        ["Date Conducted", test.date_conducted.strftime('%Y-%m-%d')],
        ["Result", test.result],
        ["Confidence Level", f"{test.confidence * 100:.2f}%"]
    ]
    test_table = Table(test_details, colWidths=[150, 350])
    test_table.setStyle(table_style)

    story.append(test_table)
    story.append(Spacer(1, 20))

    # Add image if available
    if prediction_image:
        img = Image(prediction_image)
        img.drawHeight = 4 * inch
        img.drawWidth = 4 * inch
        story.append(img)

    story.append(Spacer(1, 20))

    def footer(canvas, doc):
        canvas.saveState()
        footer_text = f"Generated on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} | Page {doc.page}"
        canvas.setFont('Helvetica', 8)
        canvas.drawString(inch, 0.75 * inch, footer_text)
        canvas.restoreState()

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    buffer.seek(0)
    return buffer
