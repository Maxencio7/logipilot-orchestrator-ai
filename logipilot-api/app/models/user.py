from sqlalchemy import Column, Integer, String, Enum as SAEnum_ sqlalchemy_Enum, Boolean # Renamed Enum to avoid conflict
from sqlalchemy.orm import relationship
from ..database import Base

# Changed class name to avoid conflict with pydantic Enum if used in the same file
class UserRoleEnum(str, sqlalchemy_Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    CLIENT = "client"
    DRIVER = "driver"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(sqlalchemy_Enum(UserRoleEnum), nullable=False, default=UserRoleEnum.CLIENT) # Use the renamed Enum
    is_active = Column(Boolean, default=True)

    # Add relationships here if needed, e.g., if a client user is linked to a client record
    # client_profile = relationship("Client", back_populates="user", uselist=False) # Example

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role.value}')>"
