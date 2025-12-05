"""leap_year
===============
Небольшая утилита для проверки, является ли год високосным.

Содержит функцию `is_leap_year(year)` и CLI-интерфейс для запуска
через командную строку: `python3 leap_year.py 2024`.
"""

from __future__ import annotations
import argparse
from typing import Iterable


def is_leap_year(year: int) -> bool:
    """
    Проверяет, является ли год високосным.

    Правило:
    - год високосный, если делится на 4 и не делится на 100, или делится на 400.

    Args:
        year: Год для проверки.

    Returns:
        True если год високосный, False иначе.
    """
    return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)


def format_result(year: int) -> str:
    """Возвращает отформатированную строку с результатом для года."""
    return f"{year}: {'високосный' if is_leap_year(year) else 'невисокосный'} год"


def next_leap_year(year: int) -> int:
    """
    Находит следующий високосный год после указанного года.

    Args:
        year: Год, от которого искать следующий високосный год.

    Returns:
        Следующий високосный год.
    """
    year += 1
    while not is_leap_year(year):
        year += 1
    return year


def previous_leap_year(year: int) -> int:
    """
    Находит предыдущий високосный год перед указанным годом.

    Args:
        year: Год, от которого искать предыдущий високосный год.

    Returns:
        Предыдущий високосный год.
    """
    year -= 1
    while year > 0 and not is_leap_year(year):
        year -= 1
    return year if year > 0 else None


def parse_years(values: Iterable[str]) -> list[int]:
    """Конвертирует и валидирует список строковых значений годов в int.

    Бросает argparse.ArgumentTypeError при некорректном значении.
    """
    years: list[int] = []
    for v in values:
        try:
            y = int(v)
        except ValueError as exc:
            raise argparse.ArgumentTypeError(f"invalid year: {v}") from exc
        years.append(y)
    return years


def main(argv: list[str] | None = None) -> int:
    """CLI entry point. Возвращает код выхода (0 - OK, 2 - ошибка парсинга)."""
    parser = argparse.ArgumentParser(
        prog="leap_year",
        description="Проверяет, является ли год високосным. Можно передать один или несколько годов."
    )
    parser.add_argument(
        "years",
        nargs="+",
        help="Год или список годов для проверки",
    )

    args = parser.parse_args(argv)

    try:
        years = parse_years(args.years)
    except argparse.ArgumentTypeError as e:
        parser.error(str(e))
        return 2

    for y in years:
        print(format_result(y))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
