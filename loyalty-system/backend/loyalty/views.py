
from decimal import Decimal, InvalidOperation, ROUND_FLOOR

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed

from supabase_client import supabase
from auth_utils import verify_supabase_token


# Example earning rule: 1 point for every 1,000 RWF spent.
POINTS_PER_1000_RWF = 1


@api_view(['POST'])
def record_purchase(request):
    # Verify that the user is logged in.
    auth_header = request.headers.get('Authorization', '')

    if not auth_header.startswith('Bearer '):
        raise AuthenticationFailed('Login token required.')

    token = auth_header.split(' ', 1)[1]
    user = verify_supabase_token(token)

    cashier_id = user.get('sub')

    if not cashier_id:
        raise AuthenticationFailed('Invalid user token.')

    # Confirm that the logged-in user is a cashier or admin.
    role_result = (
        supabase.table('staff_roles')
        .select('role')
        .eq('user_id', cashier_id)
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

    # Validate the purchase information.
    customer_id = request.data.get('customer_id')
    amount = request.data.get('amount')

    if not customer_id or amount is None:
        return Response(
            {'error': 'Customer ID and purchase amount are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        purchase_amount = Decimal(str(amount))

        if not purchase_amount.is_finite() or purchase_amount <= 0:
            raise ValueError()

        points = int(
            (purchase_amount / Decimal('1000'))
            .to_integral_value(rounding=ROUND_FLOOR)
        ) * POINTS_PER_1000_RWF

    except (InvalidOperation, ValueError, TypeError):
        return Response(
            {'error': 'Enter a valid positive purchase amount.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Record the purchase and update points in one database transaction.
    try:
        result = supabase.rpc(
            'record_purchase_and_award_points',
            {
                'p_customer_id': customer_id,
                'p_cashier_id': cashier_id,
                'p_amount': float(purchase_amount),
                'p_points_awarded': points
            }
        ).execute()

        return Response(
            {
                'message': 'Purchase recorded successfully.',
                'points_awarded': points,
                'result': result.data
            },
            status=status.HTTP_201_CREATED
        )

    except Exception:
        return Response(
            {'error': 'Unable to record purchase. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

