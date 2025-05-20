from enum import Enum
from fastapi import Depends, HTTPException, status

class UserRole(str, Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"

# Dummy current user function (replace with real auth logic)
def get_current_user():
    # Example: normally you'd decode a JWT or check session here
    # For now, a hardcoded user for demonstration
    return {"username": "alice", "role": UserRole.teacher}

# Role checker dependency
def require_role(*allowed_roles: UserRole):
    def role_checker(user=Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"
            )
        return user
    return role_checker
