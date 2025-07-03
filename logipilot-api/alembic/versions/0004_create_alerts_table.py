"""create_alerts_table

Revision ID: 0004
Revises: 0003
Create Date: YYYY-MM-DD HH:MM:SS.ffffff # Replace with actual timestamp

"""
from alembic import op
import sqlalchemy as sa
from app.models.alert import AlertSeverityEnum # Import the Enum

# revision identifiers, used by Alembic.
revision = '0004'
down_revision = '0003' # Depends on the shipments table migration
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'alerts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('shipment_id', sa.Integer(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('severity', sa.Enum(AlertSeverityEnum, name='alertseverityenum'), nullable=False, default=AlertSeverityEnum.MEDIUM.value),
        sa.Column('createdAt', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        # sa.Column('resolvedAt', sa.DateTime(timezone=True), nullable=True), # If added to model
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['shipment_id'], ['shipments.id'], name=op.f('fk_alerts_shipment_id_shipments'))
    )
    op.create_index(op.f('ix_alerts_id'), 'alerts', ['id'], unique=False)
    op.create_index(op.f('ix_alerts_shipment_id'), 'alerts', ['shipment_id'], unique=False)
    op.create_index(op.f('ix_alerts_severity'), 'alerts', ['severity'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_alerts_severity'), table_name='alerts')
    op.drop_index(op.f('ix_alerts_shipment_id'), table_name='alerts')
    op.drop_index(op.f('ix_alerts_id'), table_name='alerts')
    op.drop_table('alerts')
    # For SQLite, the Enum type is not a distinct type in the database that needs to be dropped separately.
