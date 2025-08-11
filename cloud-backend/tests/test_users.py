import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestUserAPI:
    """用户 API 测试类"""

    def test_create_user(self):
        """测试创建用户"""
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        response = client.post("/api/v1/users/", json=user_data)
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "用户创建成功"
        assert data["data"]["email"] == user_data["email"]
        assert data["data"]["username"] == user_data["username"]
        assert "id" in data["data"]

    def test_create_user_duplicate_email(self):
        """测试创建重复邮箱的用户"""
        user_data = {
            "email": "duplicate@example.com",
            "username": "user1",
            "password": "testpassword123"
        }
        # 第一次创建
        response = client.post("/api/v1/users/", json=user_data)
        assert response.status_code == 201

        # 第二次创建相同邮箱
        user_data["username"] = "user2"
        response = client.post("/api/v1/users/", json=user_data)
        assert response.status_code == 400
        assert "邮箱已被注册" in response.json()["detail"]

    def test_create_user_duplicate_username(self):
        """测试创建重复用户名的用户"""
        user_data = {
            "email": "user1@example.com",
            "username": "duplicateuser",
            "password": "testpassword123"
        }
        # 第一次创建
        response = client.post("/api/v1/users/", json=user_data)
        assert response.status_code == 201

        # 第二次创建相同用户名
        user_data["email"] = "user2@example.com"
        response = client.post("/api/v1/users/", json=user_data)
        assert response.status_code == 400
        assert "用户名已被使用" in response.json()["detail"]

    def test_get_users(self):
        """测试获取用户列表"""
        response = client.get("/api/v1/users/")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "size" in data

    def test_get_user_by_id(self):
        """测试根据 ID 获取用户"""
        # 先创建一个用户
        user_data = {
            "email": "gettest@example.com",
            "username": "gettestuser",
            "password": "testpassword123"
        }
        create_response = client.post("/api/v1/users/", json=user_data)
        user_id = create_response.json()["data"]["id"]

        # 获取用户
        response = client.get(f"/api/v1/users/{user_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["id"] == user_id
        assert data["data"]["email"] == user_data["email"]

    def test_get_user_not_found(self):
        """测试获取不存在的用户"""
        response = client.get("/api/v1/users/999999")
        assert response.status_code == 404
        assert "用户不存在" in response.json()["detail"]

    def test_update_user(self):
        """测试更新用户"""
        # 先创建一个用户
        user_data = {
            "email": "update@example.com",
            "username": "updateuser",
            "password": "testpassword123"
        }
        create_response = client.post("/api/v1/users/", json=user_data)
        user_id = create_response.json()["data"]["id"]

        # 更新用户
        update_data = {
            "full_name": "Updated Name",
            "is_active": False
        }
        response = client.put(f"/api/v1/users/{user_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["full_name"] == update_data["full_name"]
        assert data["data"]["is_active"] == update_data["is_active"]

    def test_delete_user(self):
        """测试删除用户"""
        # 先创建一个用户
        user_data = {
            "email": "delete@example.com",
            "username": "deleteuser",
            "password": "testpassword123"
        }
        create_response = client.post("/api/v1/users/", json=user_data)
        user_id = create_response.json()["data"]["id"]

        # 删除用户
        response = client.delete(f"/api/v1/users/{user_id}")
        assert response.status_code == 200
        assert "用户删除成功" in response.json()["message"]

        # 验证用户已被删除
        get_response = client.get(f"/api/v1/users/{user_id}")
        assert get_response.status_code == 404

    def test_delete_user_not_found(self):
        """测试删除不存在的用户"""
        response = client.delete("/api/v1/users/999999")
        assert response.status_code == 404
        assert "用户不存在" in response.json()["detail"]