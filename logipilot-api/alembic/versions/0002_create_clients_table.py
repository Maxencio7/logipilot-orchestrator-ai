"""create_clients_table

Revision ID: 0002
Revises: 0001
Create Date: YYYY-MM-DD HH:MM:SS.ffffff # Replace with actual timestamp

"""
from alembic import op
import sqlalchemy as sa
from app.models.client import ClientStatusEnum # Import the Enum

# revision identifiers, used by Alembic.
revision = '0002'
down_revision = '0001' # Depends on the users table migration
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'clients',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('status', sa.Enum(ClientStatusEnum, name='clientstatusenum'), nullable=False, default=ClientStatusEnum.PROSPECT.value),
        sa.Column('createdAt', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False), # For SQLite, CURRENT_TIMESTAMP
        # For PostgreSQL, use func.now() or similar: server_default=sa.func.now()
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_clients_id'), 'clients', ['id'], unique=False)
    op.create_index(op.f('ix_clients_name'), 'clients', ['name'], unique=False) # Index on name for searching/sorting
    op.create_index(op.f('ix_clients_email'), 'clients', ['email'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_clients_email'), table_name='clients')
    op.drop_index(op.f('ix_clients_name'), table_name='clients')
    op.drop_index(op.f('ix_clients_id'), table_name='clients')
    op.drop_table('clients')
    # For SQLite, the Enum type is not a distinct type in the database that needs to be dropped separately.
    # The CHECK constraint associated with it is part of the table definition.
    # If this were PostgreSQL and ClientStatusEnum was a custom type, you might use:
    # op.execute("DROP TYPE IF EXISTS clientstatusenum CASCADE")
