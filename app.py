from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime

app = Flask(__name__)
CORS(app)

# SQLAlchemy Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:@localhost/projects'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Models
class Client(db.Model):
    __tablename__ = 'clients'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    contact = db.Column(db.String(15), nullable=False)
    address = db.Column(db.String(255), nullable=True)
    company = db.Column(db.String(100), nullable=True)

class TeamMember(db.Model):
    __tablename__ = 'team_members'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    job_role = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    contact = db.Column(db.String(15), nullable=False)

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(50), nullable=False, default='Ongoing')
  

    client = db.relationship('Client', backref='projects')

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    paid_amount = db.Column(db.Float, nullable=False, default=0)
    payment_date = db.Column(db.Date, nullable=False, default=datetime.utcnow)

    client = db.relationship('Client', backref='payments')
    project = db.relationship('Project', backref='payments')

project_team_members = db.Table(
    'project_team_members',
    db.Column('project_id', db.Integer, db.ForeignKey('projects.id'), primary_key=True),
    db.Column('team_member_id', db.Integer, db.ForeignKey('team_members.id'), primary_key=True),
    db.Column('role', db.String(50), nullable=True, default='Member')
)

Project.team_members = db.relationship(
    'TeamMember',
    secondary=project_team_members,
    back_populates='projects'
)

TeamMember.projects = db.relationship(
    'Project',
    secondary=project_team_members,
    back_populates='team_members'
)

# Create all tables
with app.app_context():
    db.create_all()

#====================================================================================================================================#

#----------------------------Clients Backends---------------------------#

#Get all clients
@app.route('/api/clients', methods=['GET'])
def get_clients():
    try:
        clients = Client.query.all()
        clients_list = [
            {
                'id' : client.id,
                'name' : client.name,
                'email' : client.email,
                'contact' : client.contact,
                'address' : client.address,
                'company' : client.company
            }
            for client in clients
        ]
        return jsonify({
            'clients' : clients_list,
            'status' : 'success'
        })
    except Exception as e:
        print(f"Error fetching clients: {e}")
        return jsonify({
            'error' : str(e),
            'status' : 'error'
        })

#Add a client
@app.route('/api/clients', methods=['POST'])
def add_client():
    try:
        client_data = request.json
        new_client = Client(
            name=client_data.get('name'),
            email=client_data.get('email'),
            contact=client_data.get('contact'),
            address=client_data.get('address'),
            company=client_data.get('company')
        )
        db.session.add(new_client)  # Add the new client to the session
        db.session.commit()  # Commit the transaction
        return jsonify({
            'id': new_client.id,
            'message': 'Client added successfully',
            'status': 'success'
        })
    except Exception as e:
        print(f"Error adding client: {e}")  # Debugging log
        return jsonify({
            'error': str(e), 
            'status': 'error'
        })

# Update a client
@app.route('/api/clients/<int:id>', methods=['PUT'])
def update_client(id):
    try:
        client_data = request.json
        client = Client.query.get(id)  # Fetch the client by ID
        if not client:
            return jsonify({'message': 'Client not found', 'status': 'error'}), 404

        # Update client fields
        client.name = client_data.get('name')
        client.email = client_data.get('email')
        client.contact = client_data.get('contact')
        client.address = client_data.get('address')
        client.company = client_data.get('company')

        db.session.commit()  # Commit the changes
        return jsonify({
            'message': 'Client updated successfully',
            'status': 'success'
        })
    except Exception as e:
        print(f"Error updating client: {e}")  # Debugging log
        return jsonify({
            'error': str(e), 
            'status': 'error'
        })

# Delete a client
@app.route('/api/clients/<int:id>', methods=['DELETE'])
def delete_client(id):
    try:
        client = Client.query.get(id)  # Fetch the client by ID
        if not client:
            return jsonify({'message': 'Client not found', 'status': 'error'}), 404

        db.session.delete(client)  # Delete the client
        db.session.commit()  # Commit the transaction
        return jsonify({
            'message': 'Client deleted successfully',
            'status': 'success'
        })
    except Exception as e:
        print(f"Error deleting client: {e}")  # Debugging log
        return jsonify({
            'error': str(e), 
            'status': 'error'
        })
    
#=================================================================================================================#

#----------------------------Team Memeber Backend------------------#

# Get all team members
@app.route('/api/teams', methods=['GET'])
def get_teams():
    try:
        teams = TeamMember.query.all()  # Fetch all team members using ORM
        teams_list = [
            {
                'id': team.id,
                'name': team.name,
                'contact': team.contact,
                'email': team.email,
                'job_role': team.job_role
            }
            for team in teams
        ]
        return jsonify({'team_members': teams_list, 'status': 'success'})
    except Exception as e:
        print(f"Error fetching team members: {e}")  # Debugging log
        return jsonify({
            'error': str(e), 
            'status': 'error'
        })

# Add a team member
@app.route('/api/teams', methods=['POST'])
def add_team():
    try:
        team_data = request.json
        new_team_member = TeamMember(
            name=team_data.get('name'),
            email=team_data.get('email'),
            contact=team_data.get('contact'),
            job_role=team_data.get('job_role')
        )
        db.session.add(new_team_member)  # Add the new team member to the session
        db.session.commit()  # Commit the transaction
        return jsonify({
            'id': new_team_member.id,
            'message': 'Team member added successfully',
            'status': 'success'
        })
    except Exception as e:
        print(f"Error adding team member: {e}")  # Debugging log
        return jsonify({
            'error': str(e), 
            'status': 'error'
        })


# Update a team member
@app.route('/api/teams/<int:id>', methods=['PUT'])
def update_team(id):
    try:
        team_data = request.json
        team = TeamMember.query.get(id)  # Fetch the team member by ID
        if not team:
            return jsonify({'message': 'Team member not found', 'status': 'error'}), 404

        # Update team member fields
        team.name = team_data.get('name')
        team.email = team_data.get('email')
        team.contact = team_data.get('contact')
        team.job_role = team_data.get('job_role')

        db.session.commit()  # Commit the changes
        return jsonify({
            'message': 'Team member updated successfully',
            'status': 'success'
        })
    except Exception as e:
        print(f"Error updating team member: {e}")  # Debugging log
        return jsonify({
            'error': str(e), 
            'status': 'error'
        })

# Delete a team member
@app.route('/api/teams/<int:id>', methods=['DELETE'])
def delete_team(id):
    try:
        team = TeamMember.query.get(id)  # Fetch the team member by ID
        if not team:
            return jsonify({'message': 'Team member not found', 'status': 'error'}), 404

        db.session.delete(team)  # Delete the team member
        db.session.commit()  # Commit the transaction
        return jsonify({
            'message': 'Team member deleted successfully',
            'status': 'success'
        })
    except Exception as e:
        print(f"Error deleting team member: {e}")  # Debugging log
        return jsonify({
            'error': str(e), 
            'status': 'error'
        })

#=================================================================================================================#

#-----------------------Project Details Backend-------------------------------#

#Get All Project Details
@app.route('/api/projects', methods=['GET'])
def get_projects():
    try:
        projects = Project.query.all()  # Fetch all projects
        projects_list = []

        for project in projects:
            project_dict = {
                'id': project.id,
                'name': project.name,
                'client_id': project.client_id,
                'client_name': project.client.name,
                'description': project.description,
                'start_date': project.start_date.strftime('%Y-%m-%d') if project.start_date else None,
                'end_date': project.end_date.strftime('%Y-%m-%d') if project.end_date else None,
                'status': project.status,
                'team_members': []
            }

            # Fetch team members and their roles for the project
            for team_member in project.team_members:
                # Query the role from the association table
                role = db.session.query(project_team_members.c.role).filter_by(
                    project_id=project.id,
                    team_member_id=team_member.id
                ).scalar()

                project_dict['team_members'].append({
                    'id': team_member.id,
                    'name': team_member.name,
                    'role': role  # Include the role
                })

            projects_list.append(project_dict)

        return jsonify({
            'projects': projects_list,
            'status': 'success'
        })
    except Exception as e:
        print(f"Error fetching projects: {e}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        })

#Add a New Project
@app.route('/api/projects', methods=['POST'])
def add_project():
    try:
        project_data = request.json
        new_project = Project(
            name=project_data.get('name'),
            client_id=project_data.get('client_id'),
            description=project_data.get('description'),
            start_date=datetime.strptime(project_data.get('start_date'), '%Y-%m-%d') if project_data.get('start_date') else None,
            end_date=datetime.strptime(project_data.get('end_date'), '%Y-%m-%d') if project_data.get('end_date') else None,
            status=project_data.get('status', 'Ongoing')
        )
        db.session.add(new_project)
        db.session.commit()

        # Add team members to the project
        for member in project_data.get('team_members', []):
            team_member = TeamMember.query.get(member['team_member_id'])
            if team_member:
                new_project.team_members.append(team_member)
        db.session.commit()

        return jsonify({
            'message': 'Project added successfully', 
            'project_id': new_project.id, 
            'status': 'success'
        })
    except Exception as e:
        print(f"Error adding project: {e}")
        return jsonify({
            'error': str(e), 
            'status': 'error'
        })

#Update a Project
@app.route('/api/projects/<int:id>', methods=['PUT'])
def update_project(id):
    try:
        project_data = request.json
        project = Project.query.get(id)
        if not project:
            return jsonify({'message': 'Project not found', 'status': 'error'}), 404

        # Update project fields
        project.name = project_data.get('name')
        project.client_id = project_data.get('client_id')
        project.description = project_data.get('description')
        project.start_date = datetime.strptime(project_data.get('start_date'), '%Y-%m-%d') if project_data.get('start_date') else None
        project.end_date = datetime.strptime(project_data.get('end_date'), '%Y-%m-%d') if project_data.get('end_date') else None
        project.status = project_data.get('status')

        # Update team members
        project.team_members = []  # Clear existing team members
        for member in project_data.get('team_members', []):
            team_member = TeamMember.query.get(member['team_member_id'])
            if team_member:
                project.team_members.append(team_member)
        db.session.commit()

        return jsonify({
            'message': 'Project updated successfully', 
            'status': 'success'
        })
    except Exception as e:
        print(f"Error updating project: {e}")
        return jsonify({
            'error': str(e), 
            'status': 'error'
        })

#Delete a Project
@app.route('/api/projects/<int:id>', methods=['DELETE'])
def delete_project(id):
    try:
        project = Project.query.get(id)
        if not project:
            return jsonify({'message': 'Project not found', 'status': 'error'}), 404

        db.session.delete(project)
        db.session.commit()
        return jsonify({
            'message': 'Project deleted successfully', 
            'status': 'success'
        })
    except Exception as e:
        print(f"Error deleting project: {e}")
        return jsonify({
            'error': str(e), 
            'status': 'error'
        })

#Assign Team Member to Projects
@app.route('/api/projects/<int:project_id>/team', methods=['POST'])
def assign_team_member(project_id):
    try:
        data = request.json
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'message': 'Project not found', 'status': 'error'}), 404

        team_member = TeamMember.query.get(data.get('team_member_id'))
        if not team_member:
            return jsonify({'message': 'Team member not found', 'status': 'error'}), 404

        # Check if the team member is already assigned
        if team_member in project.team_members:
            return jsonify({'message': 'Team member is already assigned to the project', 'status': 'error'})

        
        # Assign team member with default role if not provided
        role = data.get('role', 'Member')  # Default to 'Member' if role is not provided
        db.session.execute(project_team_members.insert().values(
            project_id=project.id,
            team_member_id=team_member.id,
            role=role
        ))
        db.session.commit()

        
        # Fetch updated team members for the project
        updated_team_members = [
            {
                'id': member.id,
                'name': member.name,
                'role': db.session.query(project_team_members.c.role).filter_by(
                    project_id=project.id,
                    team_member_id=member.id
                ).scalar()
            }
            for member in project.team_members
        ]
       
        return jsonify({
            'message': 'Team member assigned to project successfully',
            'team_members': updated_team_members,
            'status': 'success'
        })
    except Exception as e:
        print(f"Error assigning team member: {e}")
        return jsonify({
            'error': str(e), 
            'status': 'error'
        })

#Remove Team Member from Project
@app.route('/api/projects/<int:project_id>/team/<int:team_member_id>', methods=['DELETE'])
def remove_team_member(project_id, team_member_id):
    try:
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'message': 'Project not found', 'status': 'error'}), 404

        team_member = TeamMember.query.get(team_member_id)
        if not team_member:
            return jsonify({'message': 'Team member not found', 'status': 'error'}), 404

        if team_member not in project.team_members:
            return jsonify({'message': 'Team member not assigned to this project', 'status': 'error'}), 404

        project.team_members.remove(team_member)
        db.session.commit()
        return jsonify({
            'message': 'Team member removed from project successfully', 
            'status': 'success'
        })
    except Exception as e:
        print(f"Error removing team member: {e}")
        return jsonify({
            'error': str(e), 
            'status': 'error'
        })

#==============================================================================================================================================\#

#------------------------Payments Details Backend-----------------------#

#Get all payments with clients and project Name
@app.route('/api/payments', methods=['GET'])
def get_payments():
    try:
        payments = Payment.query.join(Client, Payment.client_id == Client.id) \
                                .join(Project, Payment.project_id == Project.id) \
                                .add_columns(
                                    Payment.id,
                                    Payment.total_amount,
                                    Payment.paid_amount,
                                    Payment.payment_date,
                                    Client.name.label('client_name'),
                                    Project.name.label('project_name'),
                                    (Payment.total_amount - Payment.paid_amount).label('pending_amount')
                                ).order_by(Payment.payment_date.desc()).all()

        payments_list = [
            {
                'id': payment.id,
                'total_amount': payment.total_amount,
                'paid_amount': payment.paid_amount,
                'pending_amount': payment.pending_amount,
                'payment_date': payment.payment_date.strftime('%Y-%m-%d'),
                'client_name': payment.client_name,
                'project_name': payment.project_name
            }
            for payment in payments
        ]

        return jsonify({
            'payments': payments_list,
            'status': 'success'
        })
    except Exception as e:
        print(f"Error fetching payments: {e}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        })


#Get Project by client ID
@app.route('/api/projects-by-client/<int:client_id>', methods=['GET'])
def get_projects_by_client(client_id):
    try:
        projects = Project.query.filter_by(client_id=client_id).order_by(Project.name).all()
        projects_list = [
            {
                'id': project.id,
                'name': project.name
            }
            for project in projects
        ]
        return jsonify({
            'projects': projects_list,
            'status': 'success'
        })
    except Exception as e:
        print(f"Error fetching projects by client: {e}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        })

#Create a New paymnets
@app.route('/api/payments', methods=['POST'])
def create_payment():
    try:
        data = request.json
        new_payment = Payment(
            client_id=data.get('client_id'),
            project_id=data.get('project_id'),
            total_amount=data.get('total_amount'),
            paid_amount=data.get('paid_amount', 0),
            payment_date=datetime.strptime(data.get('payment_date'), '%Y-%m-%d')
        )
        db.session.add(new_payment)
        db.session.commit()

        return jsonify({
            'message': 'Payment created successfully',
            'payment_id': new_payment.id,
            'status': 'success'
        })
    except Exception as e:
        print(f"Error creating payment: {e}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        })

#Update a Paymnets

@app.route('/api/payments/<int:id>', methods=['PUT'])
def update_payment(id):
    try:
        data = request.json
        payment = Payment.query.get(id)
        if not payment:
            return jsonify({'message': 'Payment not found', 'status': 'error'}), 404

        # Update payment fields
        payment.client_id = data.get('client_id')
        payment.project_id = data.get('project_id')
        payment.total_amount = data.get('total_amount')
        payment.paid_amount = data.get('paid_amount', 0)
        payment.payment_date = datetime.strptime(data.get('payment_date'), '%Y-%m-%d')

        db.session.commit()
        return jsonify({
            'message': 'Payment updated successfully',
            'status': 'success'
        })
    except Exception as e:
        print(f"Error updating payment: {e}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        })

#Delete a Paymnets
@app.route('/api/payments/<int:id>', methods=['DELETE'])
def delete_payment(id):
    try:
        payment = Payment.query.get(id)
        if not payment:
            return jsonify({'message': 'Payment not found', 'status': 'error'}), 404

        db.session.delete(payment)
        db.session.commit()
        return jsonify({
            'message': 'Payment deleted successfully',
            'status': 'success'
        })
    except Exception as e:
        print(f"Error deleting payment: {e}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        })


#=============================================================================================================================#

#------------------Drop Down Backend-------------------------------#

#Get all Clients for DropDown

@app.route('/api/clients-dropdown', methods=['GET'])
def get_clients_dropdown():
    try:
        clients = Client.query.order_by(Client.name).all()  # Fetch all clients ordered by name
        clients_list = [
            {
                'id': client.id,
                'name': client.name
            }
            for client in clients
        ]
        return jsonify({
            'clients': clients_list,
            'status': 'success'
        })
    except Exception as e:
        print(f"Error fetching clients: {e}")  # Debugging log
        return jsonify({
            'error': str(e),
            'status': 'error'
        })

#Get All Team Members for Dropdown

@app.route('/api/team-members', methods=['GET'])
def get_team_members():
    try:
        team_members = TeamMember.query.order_by(TeamMember.name).all()  # Fetch all team members ordered by name
        team_members_list = [
            {
                'id': member.id,
                'name': member.name
            }
            for member in team_members
        ]
        return jsonify({
            'team_members': team_members_list,
            'status': 'success'
        })
    except Exception as e:
        print(f"Error fetching team members: {e}")  # Debugging log
        return jsonify({
            'error': str(e),
            'status': 'error'
        })

# Get Projects for Dropdown

@app.route('/api/projects-dropdown', methods=['GET'])
def get_projects_dropdown():
    try:
        projects = Project.query.order_by(Project.name).all()
        projects_list = [
            {
                'id': project.id,
                'name': project.name
            }
            for project in projects
        ]
        return jsonify({
            'projects': projects_list,
            'status': 'success'
        })
    except Exception as e:
        print(f"Error fetching projects: {e}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        })


#========================================================================================================================#

#----------------------Dashboard Page-----------------------------------------------#
#Dashboard page
@app.route('/api/dashboard-data', methods=['GET'])
def get_dashboard_data():
    try:
        # Query for total clients
        total_clients = db.session.query(Client).count()

        # Query for total team members
        total_team_members = db.session.query(TeamMember).count()

        # Query for total projects
        total_projects = db.session.query(Project).count()

        # Query for total amount
        total_amount = db.session.query(db.func.sum(Payment.total_amount)).scalar() or 0

        # Query for pending amount
        pending_amount = db.session.query(
            db.func.sum(Payment.total_amount - Payment.paid_amount)
        ).scalar() or 0

        # Query for total payments
        total_payments = db.session.query(Payment).count()

        # Return the aggregated data
        return jsonify({
            'status': 'success',
            'dashboard': {
                'totalClients': total_clients,
                'totalTeamMembers': total_team_members,
                'totalProjects': total_projects,
                'totalAmount': total_amount,
                'pendingAmount': pending_amount,
                'totalPayments': total_payments
            }
        })
    except Exception as e:
        print(f"Error fetching dashboard data: {e}")  # Debugging log
        return jsonify({
            'status': 'error',
            'error': str(e)
        })


#===========================================================================================================================#

#---------------Generate the PDF Backend-----------------------------#


@app.route('/api/projects/<int:project_id>/export', methods=['GET'])
def export_project_details(project_id):
    try:
        # Get project with client information
        project = db.session.query(
            Project, Client.name.label('client_name'), Client.contact_number
        ).join(
            Client, Project.client_id == Client.id
        ).filter(
            Project.id == project_id
        ).first()
        
        if not project:
            return jsonify({'status': 'error', 'message': 'Project not found'}), 404
            
        # Get payment information
        payments = db.session.query(
            db.func.sum(Payment.amount).label('total_amount'),
            db.func.sum(db.case([(Payment.status == 'Paid', Payment.amount)], else_=0)).label('paid_amount'),
            db.func.sum(db.case([(Payment.status == 'Pending', Payment.amount)], else_=0)).label('pending_amount'),
            db.func.min(Payment.payment_date).label('first_payment_date')
        ).filter(
            Payment.project_id == project_id
        ).first()
        
        # Prepare response data
        project_data = {
            'id': project.Project.id,
            'name': project.Project.name,
            'client_name': project.client_name,
            'contact_number': project.contact_number,
            'status': project.Project.status,
            'start_date': project.Project.start_date.strftime('%Y-%m-%d') if project.Project.start_date else None,
            'end_date': project.Project.end_date.strftime('%Y-%m-%d') if project.Project.end_date else None,
            'total_amount': float(payments.total_amount) if payments.total_amount else 0,
            'paid_amount': float(payments.paid_amount) if payments.paid_amount else 0,
            'pending_amount': float(payments.pending_amount) if payments.pending_amount else 0,
            'first_payment_date': payments.first_payment_date.strftime('%Y-%m-%d') if payments.first_payment_date else None
        }
        
        return jsonify({'status': 'success', 'project': project_data})
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True)
