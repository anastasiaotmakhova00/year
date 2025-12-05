async function checkYear() {
    const yearInput = document.getElementById('yearInput');
    const resultDiv = document.getElementById('result');
    const year = yearInput.value.trim();

    if (!year) {
        showError(resultDiv, 'Пожалуйста, введите год');
        return;
    }

    try {
        const response = await fetch('/api/check', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            body: null
        });

        // Используем параметр URL вместо body
        const url = new URL('/api/check', window.location.origin);
        url.searchParams.append('year', year);

        const res = await fetch(url);

        if (!res.ok) {
            const error = await res.json();
            showError(resultDiv, error.error || 'Ошибка при проверке');
            return;
        }

        const data = await res.json();
        showSuccess(resultDiv, data);
        yearInput.value = '';
    } catch (error) {
        showError(resultDiv, 'Ошибка при отправке запроса');
        console.error(error);
    }
}

async function checkMultiple() {
    const yearsInput = document.getElementById('yearsInput');
    const multiResultDiv = document.getElementById('multiResult');
    const input = yearsInput.value.trim();

    if (!input) {
        showError(multiResultDiv, 'Пожалуйста, введите хотя бы один год');
        return;
    }

    // Парсим годы из ввода
    const years = input
        .split(/[,\s]+/)
        .filter(y => y.length > 0);

    try {
        const response = await fetch('/api/check-multiple', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ years })
        });

        if (!response.ok) {
            const error = await response.json();
            showError(multiResultDiv, error.error || 'Ошибка при проверке');
            return;
        }

        const data = await response.json();
        showMultipleResults(multiResultDiv, data);
        yearsInput.value = '';
    } catch (error) {
        showError(multiResultDiv, 'Ошибка при отправке запроса');
        console.error(error);
    }
}

async function checkAdjacentLeapYears() {
    const yearInput = document.getElementById('adjacentYearInput');
    const resultDiv = document.getElementById('adjacentResult');
    const year = yearInput.value.trim();

    if (!year) {
        showError(resultDiv, 'Пожалуйста, введите год');
        return;
    }

    try {
        const url = new URL('/api/adjacent-leap-years', window.location.origin);
        url.searchParams.append('year', year);

        const res = await fetch(url);

        if (!res.ok) {
            const error = await res.json();
            showError(resultDiv, error.error || 'Ошибка при проверке');
            return;
        }

        const data = await res.json();
        showAdjacentLeapYears(resultDiv, data);
        yearInput.value = '';
    } catch (error) {
        showError(resultDiv, 'Ошибка при отправке запроса');
        console.error(error);
    }
}

function showSuccess(resultDiv, data) {
    const isLeap = data.is_leap;
    const statusClass = isLeap ? 'leap-yes' : 'leap-no';
    const statusText = isLeap ? 'ВИСОКОСНЫЙ' : 'НЕ ВИСОКОСНЫЙ';

    // Помещаем только содержимое внутрь контейнера `resultDiv`.
    // Сам контейнер получает класс `success`, чтобы показать зелёную границу только один раз.
    resultDiv.innerHTML = `
            <div>Год <strong>${data.year}</strong> — <span class="${statusClass}">${statusText}</span> год</div>
            <div style="font-size: 0.9em; margin-top: 10px; opacity: 0.8;">
                ${getLeapYearExplanation(data.year)}
            </div>
    `;
    resultDiv.classList.remove('error');
    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('success');
    // Выровнять пузырёк справа как SMS от пользователя
    resultDiv.classList.add('right');

    // Показать случайное суеверие
    showRandomSuperstition();
}

function showMultipleResults(resultDiv, data) {
    // Собираем HTML-перечень результатов без дополнительной обёртки `.result` —
    // класс `success` будет применён к контейнеру `resultDiv`.
    let html = '';

    if (data.results.length > 0) {
        data.results.forEach(item => {
            const itemClass = item.is_leap ? 'leap' : 'not-leap';
            const statusText = item.is_leap ? '✓ ВИСОКОСНЫЙ' : '✗ НЕ ВИСОКОСНЫЙ';
            html += `
                <div class="result-item ${itemClass}">
                    <strong>${item.year}</strong> — ${statusText}
                </div>
            `;
        });
    }

    if (data.error_count > 0) {
        html += '<div style="margin-top: 10px; color: #ef4444;">';
        data.errors.forEach(error => {
            html += `<div>⚠️ ${error}</div>`;
        });
        html += '</div>';
    }

    html += `
        <div class="summary">
            Проверено: ${data.total} ${getPluralForm(data.total, 'год', 'года', 'лет')}
            ${data.error_count > 0 ? `, ошибок: ${data.error_count}` : ''}
        </div>
    `;

    resultDiv.innerHTML = html;
    resultDiv.classList.remove('error');
    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('success');

    // Показать случайное суеверие при успешном множественном выводе
    showRandomSuperstition();
}

function showAdjacentLeapYears(resultDiv, data) {
    const prevYear = data.previous_leap_year;
    const nextYear = data.next_leap_year;
    const isLeap = data.is_leap;

    // Собираем HTML без внешней обёртки — контейнер `resultDiv` сам получит класс `success`.
    let html = '';

    html += `<div style="margin-bottom: 15px;"><strong>Год ${data.year}:</strong> <span class="${isLeap ? 'leap-yes' : 'leap-no'}">${isLeap ? 'ВИСОКОСНЫЙ' : 'НЕ ВИСОКОСНЫЙ'}</span></div>`;

    html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">';
    
    // Предыдущий високосный год
    if (prevYear) {
        const yearsBefore = data.previous_leap_years_away;
        html += `
            <div style="background: #fef9e7; padding: 12px; border-radius: 6px; border-left: 3px solid #fbbf24;">
                <div style="font-weight: 600; color: #92400e;">← Предыдущий</div>
                <div style="font-size: 1.4em; color: #d97706; margin: 5px 0;"><strong>${prevYear}</strong></div>
                <div style="font-size: 0.85em; color: #92400e;">Было ${yearsBefore} ${getPluralForm(yearsBefore, 'год', 'года', 'лет')} назад</div>
            </div>
        `;
    }
    
    // Следующий високосный год
    if (nextYear) {
        const yearsAfter = data.next_leap_years_away;
        html += `
            <div style="background: #e0f2fe; padding: 12px; border-radius: 6px; border-left: 3px solid #0ea5e9;">
                <div style="font-weight: 600; color: #0c4a6e;">Следующий →</div>
                <div style="font-size: 1.4em; color: #0284c7; margin: 5px 0;"><strong>${nextYear}</strong></div>
                <div style="font-size: 0.85em; color: #0c4a6e;">Будет через ${yearsAfter} ${getPluralForm(yearsAfter, 'год', 'года', 'лет')}</div>
            </div>
        `;
    }
    
    html += '</div>';
    html += '</div>';
    
    resultDiv.innerHTML = html;
    resultDiv.classList.remove('error');
    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('success');

    // Показать случайное суеверие при выводе соседних високосных лет
    showRandomSuperstition();

    // Выровнять пузырёк справа как SMS от пользователя
    resultDiv.classList.add('right');
}

function showError(resultDiv, message) {
    // Для ошибок — помещаем текст в контейнер и ставим класс `error` только на контейнере.
    resultDiv.innerHTML = `❌ ${message}`;
    resultDiv.classList.remove('success');
    resultDiv.classList.add('error');
    // Скрываем суеверие при ошибке
    const sup = document.getElementById('superstition');
    if (sup) sup.classList.add('hidden');
    // Убираем выравнивание справа для ошибок
    resultDiv.classList.remove('right');
    // Показываем контейнер с ошибкой (он может быть скрыт)
    resultDiv.classList.remove('hidden');
}

// Список коротких суеверий/поговорок про високосные годы
const SUPERSTITIONS = [
    'Говорят, что високосный год приносит крупные перемены.',
    'Народная молва: свадьбы в високосный год рискованны.',
    'Кто родился в високосный год — часто к удаче.',
    'Некоторые считают: не начинать больших дел в високосный год.',
    'Говорят, что неожиданные встречи случаются чаще в високосный год.'
];

function showRandomSuperstition() {
    const sup = document.getElementById('superstition');
    if (!sup) return;
    const text = SUPERSTITIONS[Math.floor(Math.random() * SUPERSTITIONS.length)];
    sup.textContent = text;
    sup.classList.remove('hidden');
    // лёгкая анимация
    sup.classList.remove('fade');
    // reflow to restart animation
    // eslint-disable-next-line no-unused-expressions
    sup.offsetWidth;
    sup.classList.add('fade');
}

function getLeapYearExplanation(year) {
    if (year % 400 === 0) {
        return `${year} ÷ 400 = ${year / 400} (делится на 400)`;
    } else if (year % 100 === 0) {
        return `${year} ÷ 100 = ${year / 100}, но не делится на 400`;
    } else if (year % 4 === 0) {
        return `${year} ÷ 4 = ${year / 4} (делится на 4, не делится на 100)`;
    } else {
        return `${year} не делится на 4`;
    }
}

function getPluralForm(number, form1, form2, form5) {
    const mod10 = number % 10;
    const mod100 = number % 100;

    if (mod10 === 1 && mod100 !== 11) {
        return form1;
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        return form2;
    } else {
        return form5;
    }
}

// Добавляем поддержку Enter для проверки одного года
document.getElementById('yearInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkYear();
    }
});

// Добавляем поддержку Ctrl+Enter для проверки нескольких лет
document.getElementById('yearsInput')?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        checkMultiple();
    }
});
