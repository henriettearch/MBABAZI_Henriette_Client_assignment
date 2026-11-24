from django.urls import path
from .views import record_purchase

urlpatterns = [
    path('record-purchase/', record_purchase, name='record-purchase'),
]