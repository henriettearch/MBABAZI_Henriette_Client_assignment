
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed

from supabase_client import supabase
from auth_utils import verify_supabase_token


@api_view(['GET'])
def cashier_dashboard(request):
    # Check login token
    auth_header = request.headers.get('Authorization', '')

    if not auth_header.startswith('Bearer '):
        raise AuthenticationFailed('Login token required.')

    token = auth_header.split(' ', 1)[1]
    user = verify_supabase_token(token)

    user_id = user.get('sub')

    if not user_id:
        raise AuthenticationFailed('Invalid user token.')

    # Verify cashier or admin role
    try:
        role_result = (
            supabase.table('staff_roles')
            .select('role')
            .eq('user_id', user_id)
            .limit(1)
            .execute()
        )

        if (
            not role_result.data
            or role_result.data[0]['role'] not in ['cashier', 'admin']
        ):
            return Response(
                {'error': 'Staff access required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get total customer count
        count_result = (
            supabase.table('profiles')
            .select('id', count='exact')
            .execute()
        )

        total_customers = count_result.count or 0

        # Get five most recently registered customers
        recent_result = (
            supabase.table('profiles')
            .select(
                'id, first_name, last_name, email, phone, '
                'loyalty_points, created_at'
            )
            .order('created_at', desc=True)
            .limit(5)
            .execute()
        )

        return Response(
            {
                'cashier_email': user.get('email'),
                'total_customers': total_customers,
                'recent_customers': recent_result.data
            },
            status=status.HTTP_200_OK
        )

    except Exception:
        return Response(
            {'error': 'Unable to load cashier dashboard.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

