
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed

from supabase_client import supabase
from auth_utils import verify_supabase_token


@api_view(['GET'])
def customer_list(request):
    auth_header = request.headers.get('Authorization', '')

    if not auth_header.startswith('Bearer '):
        raise AuthenticationFailed('Login token required.')

    token = auth_header.split(' ', 1)[1]
    user = verify_supabase_token(token)

    user_id = user.get('sub')

    if not user_id:
        raise AuthenticationFailed('Invalid user token.')

    try:
        # Verify that the logged-in user is authorized staff
        role_result = (
            supabase.table('staff_roles')
            .select('role')
            .eq('user_id', user_id)
            .limit(1)
            .execute()
        )

        if not role_result.data or role_result.data[0]['role'] not in ['cashier', 'admin']:
            return Response(
                {'error': 'Staff access required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Search customers
        search = request.query_params.get('search', '').strip()

        query = (
            supabase.table('profiles')
            .select(
                'id, first_name, last_name, email, phone, loyalty_points'
            )
        )

        if search:
            safe_search = (
                search.replace('%', '')
                .replace(',', '')
                .replace('(', '')
                .replace(')', '')
            )

            query = query.or_(
                f'first_name.ilike.%{safe_search}%,'
                f'last_name.ilike.%{safe_search}%,'
                f'email.ilike.%{safe_search}%,'
                f'phone.ilike.%{safe_search}%'
            )

        customers = query.limit(50).execute()

        return Response(
            customers.data,
            status=status.HTTP_200_OK
        )

    except Exception:
        return Response(
            {'error': 'Unable to retrieve customers.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

