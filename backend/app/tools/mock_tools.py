"""
Mock Tools Execution Layer for AgentShield
Provides safe, sandboxed simulation tools operating exclusively on mock data.
"""

from typing import Dict, Any

class MockToolRegistry:
    MOCK_FILES = {
        "public_info.txt": "AgentShield v1.0 Overview: Context-Aware Security Middleware for AI Agents.",
        "product_catalog.json": '{"products": [{"id": 1, "name": "AgentShield Security Gateway", "status": "active"}]}',
        "credentials.json": '{"db_user": "admin_svc", "db_password": "super_secret_token_987#", "api_key": "sk_live_mock_881923"}',
        "system_config.json": '{"env": "production", "debug": false, "security_level": "strict"}'
    }

    MOCK_DATABASES = {
        "customer_records": [
            {"customer_id": "CUST-1001", "name": "Alice Smith", "email": "alice@example.com", "balance": "$45,200.00"},
            {"customer_id": "CUST-1002", "name": "Bob Jones", "email": "bob@example.com", "balance": "$128,400.00"}
        ],
        "product_information": [
            {"sku": "PROD-A", "name": "Enterprise Shield", "price": 499.00},
            {"sku": "PROD-B", "name": "Agent Monitor", "price": 199.00}
        ]
    }

    @staticmethod
    def execute(tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes mock tool safely.
        """
        name = tool_name.lower()
        resource = parameters.get("resource", parameters.get("filename", parameters.get("query", "default")))

        if name == "read_file":
            content = MockToolRegistry.MOCK_FILES.get(resource, f"Mock content for file: {resource}")
            return {
                "status": "success",
                "tool": tool_name,
                "resource": resource,
                "data": content
            }

        elif name == "query_database":
            data = MockToolRegistry.MOCK_DATABASES.get(resource, [{"record_id": 1, "info": f"Sample database result for {resource}"}])
            return {
                "status": "success",
                "tool": tool_name,
                "resource": resource,
                "records_returned": len(data),
                "data": data
            }

        elif name == "get_credentials":
            return {
                "status": "success",
                "tool": tool_name,
                "resource": "credentials.json",
                "data": MockToolRegistry.MOCK_FILES["credentials.json"]
            }

        elif name == "get_system_config":
            return {
                "status": "success",
                "tool": tool_name,
                "resource": "system_config.json",
                "data": MockToolRegistry.MOCK_FILES["system_config.json"]
            }

        elif name == "send_data":
            dest = parameters.get("destination", parameters.get("endpoint", "external_api"))
            return {
                "status": "simulated_success",
                "tool": tool_name,
                "destination": dest,
                "bytes_sent": 1024,
                "message": f"Simulated payload delivery to external endpoint '{dest}'"
            }

        elif name == "search_records" or name == "get_user_profile":
            return {
                "status": "success",
                "tool": tool_name,
                "resource": resource,
                "data": {"user_id": "usr_99", "role": "operator", "status": "active"}
            }

        return {
            "status": "success",
            "tool": tool_name,
            "resource": resource,
            "message": f"Generic mock tool '{tool_name}' executed safely."
        }
