import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import ExamifyUser


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth = request.headers.get('Authorization', '').split()
        if not auth:
            return None
        if auth[0].lower() != 'bearer':
            return None
        
        if len(auth) != 2:
            raise AuthenticationFailed("Invalid token header")
        
        token = auth[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            if not user_id:
                raise AuthenticationFailed("Invalid token payload")
                
            user = ExamifyUser.objects.get(id=user_id)
            if not user.is_active:
                raise AuthenticationFailed("User inactive")
                
            return (user, token)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired")
        except jwt.PyJWTError as e:
            raise AuthenticationFailed(f"Invalid token: {str(e)}")
        except ExamifyUser.DoesNotExist:
            raise AuthenticationFailed("User not found")
            
    def authenticate_header(self, request) -> str:
        return "Bearer"
