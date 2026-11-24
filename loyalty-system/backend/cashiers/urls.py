
from django.urls import path
from .views import cashier_dashboard

urlpatterns = [
    path('dashboard/', cashier_dashboard, name='cashier-dashboard'),
]
