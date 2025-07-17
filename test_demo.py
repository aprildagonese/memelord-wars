import unittest
import os
import json
from unittest.mock import patch, MagicMock, Mock
import sys

# Import the module to test
import use_agent_endpoint_key


class TestUseAgentEndpointKey(unittest.TestCase):
    
    def setUp(self):
        """Set up test environment variables"""
        self.test_access_key = "test-model-access-key-123"
        
    @patch.dict(os.environ, {
        'MODEL_ACCESS_KEY': 'test-model-access-key-123',
        'DO_ENDPOINT': 'https://inference.do-ai.run/v1',
        'MODEL_NAME': 'llama3.3-70b-instruct'
    })
    @patch('use_agent_endpoint_key.OpenAI')
    def test_openai_client_initialization(self, mock_openai):
        """Test that OpenAI client is initialized with correct parameters"""
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        
        # Mock the response
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_choice.message.content = '{"capital": "Paris"}'
        mock_response.choices = [mock_choice]
        mock_response.to_dict.return_value = {"usage": {"prompt_tokens": 10, "completion_tokens": 20}}
        mock_client.chat.completions.create.return_value = mock_response
        
        # Import and run the main module
        import importlib
        importlib.reload(use_agent_endpoint_key)
        
        # Verify OpenAI client was initialized with correct parameters
        mock_openai.assert_called_once_with(
            base_url="https://inference.do-ai.run/v1",
            api_key="test-model-access-key-123"
        )
        
    @patch.dict(os.environ, {
        'MODEL_ACCESS_KEY': 'test-model-access-key-123',
        'DO_ENDPOINT': 'https://inference.do-ai.run/v1',
        'MODEL_NAME': 'llama3.3-70b-instruct'
    })
    @patch('use_agent_endpoint_key.OpenAI')
    def test_chat_completion_call(self, mock_openai):
        """Test that chat completion is called with correct parameters"""
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        
        # Mock the response
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_choice.message.content = '{"capital": "Paris"}'
        mock_response.choices = [mock_choice]
        mock_response.to_dict.return_value = {"usage": {"prompt_tokens": 10, "completion_tokens": 20}}
        mock_client.chat.completions.create.return_value = mock_response
        
        # Import and run the main module
        import importlib
        importlib.reload(use_agent_endpoint_key)
        
        # Verify chat completion was called with correct parameters
        mock_client.chat.completions.create.assert_called_once_with(
            model="llama3.3-70b-instruct",
            messages=[{"role": "user", "content": "What is the capital of France? Please respond in JSON format."}],
            temperature=0.7,
            max_tokens=100
        )
        
    @patch.dict(os.environ, {
        'MODEL_ACCESS_KEY': 'test-model-access-key-123',
        'DO_ENDPOINT': 'https://inference.do-ai.run/v1',
        'MODEL_NAME': 'llama3.3-70b-instruct'
    })
    @patch('use_agent_endpoint_key.OpenAI')
    @patch('builtins.print')
    def test_response_processing(self, mock_print, mock_openai):
        """Test that response is processed and printed correctly"""
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        
        # Mock the response
        mock_response = MagicMock()
        mock_choice1 = MagicMock()
        mock_choice1.message.content = '{"capital": "Paris"}'
        mock_choice2 = MagicMock()
        mock_choice2.message.content = 'Additional response'
        mock_response.choices = [mock_choice1, mock_choice2]
        mock_response.to_dict.return_value = {"usage": {"prompt_tokens": 10, "completion_tokens": 20}, "model": "llama3.3-70b-instruct"}
        mock_client.chat.completions.create.return_value = mock_response
        
        # Import and run the main module
        import importlib
        importlib.reload(use_agent_endpoint_key)
        
        # Verify print was called correctly
        expected_calls = [
            unittest.mock.call('{"capital": "Paris"}'),
            unittest.mock.call('Additional response'),
            unittest.mock.call('\nFull response details:'),
            unittest.mock.call('{\n  "usage": {\n    "prompt_tokens": 10,\n    "completion_tokens": 20\n  },\n  "model": "llama3.3-70b-instruct"\n}')
        ]
        mock_print.assert_has_calls(expected_calls)
        
    @patch.dict(os.environ, {}, clear=True)
    def test_missing_environment_variables(self):
        """Test behavior when environment variables are missing"""
        # This should cause an error when trying to use None as api_key
        with self.assertRaises(Exception):
            import importlib
            importlib.reload(use_agent_endpoint_key)
            
    @patch.dict(os.environ, {
        'MODEL_ACCESS_KEY': 'test-model-access-key-123',
        'DO_ENDPOINT': 'https://inference.do-ai.run/v1',
        'MODEL_NAME': 'llama3.3-70b-instruct'
    })
    @patch('use_agent_endpoint_key.OpenAI')
    def test_empty_response_choices(self, mock_openai):
        """Test handling of empty response choices"""
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        
        # Mock the response with empty choices
        mock_response = MagicMock()
        mock_response.choices = []
        mock_response.to_dict.return_value = {"usage": {"prompt_tokens": 10, "completion_tokens": 0}}
        mock_client.chat.completions.create.return_value = mock_response
        
        # Import and run the main module - should not raise an error
        import importlib
        importlib.reload(use_agent_endpoint_key)
        
        # Verify the response was processed
        mock_response.to_dict.assert_called_once()


if __name__ == '__main__':
    unittest.main()