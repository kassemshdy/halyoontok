from setuptools import setup, find_packages

setup(
    name="halyoontok-shared",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "sqlalchemy>=2.0",
        "psycopg2-binary>=2.9",
        "pydantic[email]>=2.10",
        "python-jose[cryptography]>=3.3",
        "passlib[bcrypt]>=1.7",
        "boto3>=1.35",
        "redis>=5.2",
        "Pillow>=10.0",
        "eval_type_backport>=0.2",
    ],
)
