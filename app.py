"""
Веб-приложение Flask для определения високосных лет.
"""

from flask import Flask, render_template, request, jsonify
from leap_year import is_leap_year, format_result, next_leap_year, previous_leap_year

app = Flask(__name__)


@app.route('/')
def index():
    """Главная страница веб-приложения."""
    return render_template('index.html')


@app.route('/api/check', methods=['GET', 'POST'])
def check_leap_year():
    """API endpoint для проверки года."""
    if request.method == 'POST':
        data = request.get_json()
        year_str = data.get('year', '').strip()
    else:
        year_str = request.args.get('year', '').strip()

    if not year_str:
        return jsonify({'error': 'Год не указан'}), 400

    try:
        year = int(year_str)
    except ValueError:
        return jsonify({'error': 'Год должен быть числом'}), 400

    is_leap = is_leap_year(year)
    return jsonify({
        'year': year,
        'is_leap': is_leap,
        'message': format_result(year)
    })


@app.route('/api/check-multiple', methods=['POST'])
def check_multiple():
    """API endpoint для проверки нескольких лет."""
    data = request.get_json()
    years_str = data.get('years', [])

    if not years_str:
        return jsonify({'error': 'Годы не указаны'}), 400

    results = []
    errors = []

    for year_str in years_str:
        try:
            year = int(str(year_str).strip())
            results.append({
                'year': year,
                'is_leap': is_leap_year(year),
                'message': format_result(year)
            })
        except ValueError:
            errors.append(f'Некорректное значение года: {year_str}')

    return jsonify({
        'results': results,
        'errors': errors,
        'total': len(results),
        'error_count': len(errors)
    })


@app.route('/api/adjacent-leap-years', methods=['GET', 'POST'])
def adjacent_leap_years():
    """API endpoint для поиска следующего и предыдущего високосного года."""
    if request.method == 'POST':
        data = request.get_json()
        year_str = data.get('year', '').strip()
    else:
        year_str = request.args.get('year', '').strip()

    if not year_str:
        return jsonify({'error': 'Год не указан'}), 400

    try:
        year = int(year_str)
    except ValueError:
        return jsonify({'error': 'Год должен быть числом'}), 400

    next_year = next_leap_year(year)
    prev_year = previous_leap_year(year)
    is_current_leap = is_leap_year(year)

    return jsonify({
        'year': year,
        'is_leap': is_current_leap,
        'next_leap_year': next_year,
        'next_leap_years_away': next_year - year,
        'previous_leap_year': prev_year,
        'previous_leap_years_away': year - prev_year if prev_year else None,
        'message': format_result(year)
    })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
