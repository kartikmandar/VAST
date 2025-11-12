from django.test import TestCase
from rest_framework.test import APIClient

class AccountViewsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        
    def test_register_user(self):
        # TODO: Add proper tests
        pass
        
    def test_login_user(self):
        # TODO: Add proper tests
        pass 