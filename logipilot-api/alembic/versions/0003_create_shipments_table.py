"""create_shipments_table

Revision ID: 0003
Revises: 0002
Create Date: YYYY-MM-DD HH:MM:SS.ffffff # Replace with actual timestamp

"""
from alembic import op
import sqlalchemy as sa
from app.models.shipment import ShipmentStatusEnum # Import the Enum

# revision identifiers, used by Alembic.
revision = '0003'
down_revision = '0002' # Depends on the clients table migration
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'shipments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum(ShipmentStatusEnum, name='shipmentstatusenum'), nullable=False, default=ShipmentStatusEnum.PENDING.value),
        sa.Column('origin', sa.String(), nullable=False),
        sa.Column('destination', sa.String(), nullable=False),
        sa.Column('createdAt', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], name=op.f('fk_shipments_client_id_clients'))
    )
    op.create_index(op.f('ix_shipments_id'), 'shipments', ['id'], unique=False)
    op.create_index(op.f('ix_shipments_client_id'), 'shipments', ['client_id'], unique=False) # Index on client_id
    op.create_index(op.f('ix_shipments_status'), 'shipments', ['status'], unique=False) # Index on status


def downgrade():
    op.drop_index(op.f('ix_shipments_status'), table_name='shipments')
    op.drop_index(op.f('ix_shipments_client_id'), table_name='shipments')
    op.drop_index(op.f('ix_shipments_id'), table_name='shipments')
    op.drop_table('shipments')
    # For SQLite, the Enum type is not a distinct type in the database that needs to be dropped separately.
