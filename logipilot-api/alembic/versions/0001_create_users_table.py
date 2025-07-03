"""create_users_table

Revision ID: 0001
Revises:
Create Date: YYYY-MM-DD HH:MM:SS.ffffff # Replace with actual timestamp when running

"""
from alembic import op
import sqlalchemy as sa
from app.models.user import UserRoleEnum # Import the Enum for the role column

# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None # This is the first migration
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.Enum(UserRoleEnum, name='userroleenum'), nullable=False, default=UserRoleEnum.CLIENT.value),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    # For SQLite, the Enum type is not a distinct type in the database that needs to be dropped separately.
    # The CHECK constraint associated with it is part of the table definition and is removed when the table is dropped.
    # If this were PostgreSQL and UserRoleEnum was a custom type, you might use:
    # op.execute("DROP TYPE IF EXISTS userroleenum CASCADE")
    # or have SQLAlchemy handle it if it created the type.
