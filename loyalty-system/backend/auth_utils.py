import os
import jwt
from jwt import PyJWKClient
from dotenv import load_dotenv
from rest_framework.exceptions import AuthenticationFailed

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"

jwks_client = PyJWKClient(JWKS_URL)


def verify_supabase_token(token):
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            audience="authenticated",
        )

        return payload

    except Exception:
        raise AuthenticationFailed("Invalid or expired login token.")
