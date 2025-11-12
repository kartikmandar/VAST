from django.test import TestCase
from rest_framework.test import APIClient

class DataViewsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        
    def test_data_operations(self):
        # TODO: Add proper tests
        pass 