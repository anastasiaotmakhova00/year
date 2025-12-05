import json
import pytest

from leap_year import is_leap_year, next_leap_year, previous_leap_year
from app import app


def test_is_leap_year_examples():
    assert is_leap_year(2024) is True
    assert is_leap_year(2000) is True
    assert is_leap_year(1900) is False
    assert is_leap_year(2023) is False


def test_next_previous_leap_year():
    assert next_leap_year(2023) == 2024
    assert previous_leap_year(2023) == 2020

    assert next_leap_year(2000) == 2004
    assert previous_leap_year(2001) == 2000

    # edge: year itself is leap -> next should be after
    assert next_leap_year(2024) == 2028
    assert previous_leap_year(2024) == 2020


def test_api_check_single(client):
    res = client.get('/api/check?year=2024')
    assert res.status_code == 200
    data = res.get_json()
    assert data['year'] == 2024
    assert data['is_leap'] is True


def test_api_check_multiple(client):
    payload = {'years': ['2023', '2024', '1900']}
    res = client.post('/api/check-multiple', data=json.dumps(payload), content_type='application/json')
    assert res.status_code == 200
    data = res.get_json()
    years = {item['year']: item['is_leap'] for item in data['results']}
    assert years[2023] is False
    assert years[2024] is True
    assert years[1900] is False


def test_api_adjacent(client):
    res = client.get('/api/adjacent-leap-years?year=2023')
    assert res.status_code == 200
    data = res.get_json()
    assert data['year'] == 2023
    assert data['next_leap_year'] == 2024
    assert data['previous_leap_year'] == 2020


@pytest.fixture
def client():
    return app.test_client()
