from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User
from passlib.context import CryptContext
from sqlalchemy.exc import SQLAlchemyError

from app.helpers import hash_password


def create_admin_user(username: str, password: str, display_name: str, email: str):
    """
    Creates a new admin user if the username doesn't already exist.
    Args:
        username (str): Admin username.
        password (str): Admin password.
        display_name (str): Display name for the admin user.
        email (str): Email address of the admin user.
    """
    # Start a new database session
    db: Session = SessionLocal()

    try:
        # Check if the user already exists
        existing_user = db.query(User).filter(User.username == username).first()
        if existing_user:
            print(f"User with username '{username}' already exists.")
            return {"success": False, "message": f"User with username '{username}' already exists."}

        # Hash the password
        hashed_password = hash_password(password)

        # Create a new admin user
        admin_user = User(
            username=username,
            display_name=display_name,
            email=email,
            password_hash=hashed_password,  # Store the hashed password
            is_admin=True  # This flag makes the user an admin
        )

        # Add the new user to the database
        db.add(admin_user)
        db.commit()

        print(f"Admin user '{username}' created successfully.")
        return {"success": True, "message": f"Admin user '{username}' created successfully."}

    except SQLAlchemyError as e:
        db.rollback()
        print(f"Error occurred while creating the user: {str(e)}")
        return {"success": False, "message": f"Error occurred while creating the user: {str(e)}"}

    finally:
        db.close()


# If running as a standalone script
if __name__ == "__main__":
    # Modify these values to create an admin user
    admin_username = "admin"
    admin_password = "@Adminpassword123"
    admin_display_name = "Administrator"
    admin_email = "admin@example.com"

    # Create the admin user
    result = create_admin_user(admin_username, admin_password, admin_display_name, admin_email)

    # Provide feedback based on the result
    if result["success"]:
        print(result["message"])
    else:
        print(f"Failed: {result['message']}")
