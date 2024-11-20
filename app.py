from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from decimal import Decimal
import json


app = Flask(__name__)
CORS(app)

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'slaperthan',  # Replace with your actual password
    'database': 'PFMS'  # Replace with your actual database name
}

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')

    if not phone.isdigit() or len(phone) != 10:
        return jsonify({"error": "Phone number must be exactly 10 digits and numeric."}), 400

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        cursor.callproc('BeforeUserInsert', (name, email, phone, password))
        
        cursor.execute("INSERT INTO user (name, email, phone, password) VALUES (%s, %s, %s, %s)",
                       (name, email, phone, password))
        conn.commit()
        return jsonify({"message": "User created successfully!"}), 201

    except mysql.connector.Error as err:
        if "This Mail is already influenced" in str(err):
            return jsonify({"error": "This Mail is already influenced."}), 400
        elif "This phone number is already in use" in str(err):
            return jsonify({"error": "This phone number is already in use."}), 400
        else:
            return jsonify({"error": "Unexpected error occurred, please try again."}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT name, email, is_admin FROM user WHERE email = %s AND password = %s", (email, password))
        user = cursor.fetchone()

        if user:
            return jsonify({"message": "User exists!", "name": user[0], "email": user[1], "is_admin": user[2]}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 400

    except mysql.connector.Error as err:
        print("Error:", str(err))
        return jsonify({"error": "Unexpected error occurred, please try again."}), 400
    finally:
        cursor.close()
        conn.close()


@app.route('/api/check-email', methods=['POST'])
def check_email():
    data = request.json
    email = data.get('email')

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        cursor.callproc('CheckEmailExists', (email,))
        for result in cursor.stored_results():
            exists = result.fetchone()[0] > 0
            return jsonify({"exists": exists}), 200

    except mysql.connector.Error as err:
        print("Error:", str(err))
        return jsonify({"error": "Unexpected error occurred"}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/api/check-phone', methods=['POST'])
def check_phone():
    data = request.json
    email = data.get('email')
    phone = data.get('phone')

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        cursor.callproc('CheckPhone', (email, phone))
        for result in cursor.stored_results():
            match = result.fetchone()
            if match and match[0] == 1:
                return jsonify({"matches": True}), 200
            else:
                return jsonify({"matches": False}), 400

    except mysql.connector.Error as err:
        print("Error:", str(err))
        return jsonify({"error": "Unexpected error occurred, please try again."}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/api/update-password', methods=['POST'])
def update_password():
    data = request.json
    email = data.get('email')
    new_password = data.get('newPassword')

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        cursor.callproc('UpdateUserPassword', (email, new_password))
        conn.commit()
        return jsonify({"updated": True}), 200

    except mysql.connector.Error as err:
        print("Error:", str(err))
        return jsonify({"error": "Unexpected error occurred"}), 400
    finally:
        cursor.close()
        conn.close()

# Income Related
@app.route('/add_income', methods=['POST'])
def add_income():
    data = request.json
    email = data.get('email')
    income_amt = data.get('income_amt')
    income_type = data.get('income_type')
    month = data.get('month')  # Month as VARCHAR
    year = data.get('year')  # Year as INT

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        cursor.callproc('AddIncome', (email, income_amt, income_type, month, year))  # Pass month as VARCHAR
        conn.commit()
        return jsonify({"message": "Income added successfully!"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/update_income', methods=['PUT'])
def update_income():
    data = request.json
    income_id = data.get('income_id')
    income_amt = data.get('income_amt')
    income_type = data.get('income_type')
    month = data.get('month')  # Month as VARCHAR
    year = data.get('year')  # Year as INT

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        cursor.callproc('UpdateIncome', (income_id, income_amt, income_type, month, year))  # Pass month as VARCHAR
        conn.commit()
        return jsonify({"message": "Income updated successfully!"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        conn.close()


@app.route('/fetch_income', methods=['GET'])
def fetch_income():
    email = request.args.get('email')
    month = request.args.get('month')  # Month as VARCHAR
    year = request.args.get('year', type=int)  # Year as INT

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        cursor.callproc('FetchIncome', (email, month, year))  # Pass month as VARCHAR
        income_data = []

        for result in cursor.stored_results():
            income_data = result.fetchall()

        if not income_data:
            return jsonify({"income": []}), 200

        return jsonify({"income": income_data}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/delete_income', methods=['DELETE'])
def delete_income():
    income_id = request.args.get('income_id')

    if not income_id:
        return jsonify({"error": "income_id is required."}), 400

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        # Call the procedure to delete the income by income_id
        cursor.callproc('DeleteIncome', (income_id,))
        conn.commit()
        return jsonify({"message": "Income deleted successfully!"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/total_income', methods=['GET'])
def total_income():
    email = request.args.get('email')
    month = request.args.get('month')  # Month as VARCHAR
    year = request.args.get('year', type=int)  # Year as INT

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        # Step 1: Fetch user_id from the user table based on the email
        cursor.execute("""
            SELECT user_id 
            FROM user 
            WHERE email = %s
        """, (email,))
        user_id_result = cursor.fetchone()

        # Check if user exists
        if user_id_result is None:
            return jsonify({"error": "User not found"}), 404

        user_id = user_id_result[0]

        # Step 2: Fetch total income using the user_id, month, and year from the income table
        cursor.execute("""
            SELECT SUM(income_amt) 
            FROM income 
            WHERE user_id = %s AND month = %s AND year = %s
        """, (user_id, month, year))

        total_income = cursor.fetchone()[0]

        # If no income is found for the given criteria, return 0
        if total_income is None:
            total_income = 0

        return jsonify({"total_income": str(total_income)}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        conn.close()


#Budget Related
@app.route('/fetch_budget', methods=['GET'])
def fetch_budget():
    email = request.args.get('email')
    month = request.args.get('month')
    year = request.args.get('year')

    if not email or not month or not year:
        return jsonify({'error': 'Missing required parameters'}), 400

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Call the stored procedure with the provided email, month, and year
        cursor.callproc('GetBudgetsByUser', [email, month, year])

        budgets = []
        for result_set in cursor.stored_results():
            for row in result_set.fetchall():
                budgets.append({
                    'budget_id': row[0],
                    'category': row[1],
                    'budget_amt': row[2],
                    'month': row[3],
                    'year': row[4],
                })

        cursor.close()
        conn.close()

        if not budgets:
            return jsonify({'message': 'No budget data found', 'budgets': []}), 200

        # Return the budget data as JSON
        return jsonify({'budgets': budgets}), 200


    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return jsonify({'error': f'Database error: {err}'}), 500
    except Exception as e:
        print(f"General error: {e}")
        return jsonify({'error': f'An unexpected error occurred: {e}'}), 500


@app.route('/add_budget', methods=['POST'])
def add_budget():
    data = request.get_json()
    email = data['email']
    budget_type = data['budget_type']
    budget_amount = data['budget_amt']
    month = data['month']
    year = data['year']
    description = data.get('description', '')

    # Connect to the database
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        # Call the stored procedure
        cursor.callproc('AddBudget', [email, budget_type, budget_amount, month, year, description])
        conn.commit()
        return jsonify({'message': 'Budget added successfully'}), 200
    except mysql.connector.Error as err:
        conn.rollback()

        # Check if the error is due to the duplicate budget type SIGNAL
        if "This budget type has already been used for the selected month and year" in str(err):
            return jsonify({'message': 'This budget type has already been used for the selected month and year'}), 400
        else:
            # General error fallback
            return jsonify({'message': f'Error occurred: {str(err)}'}), 500
    finally:
        cursor.close()
        conn.close()



@app.route('/update_budget', methods=['PUT'])
def update_budget():
    data = request.get_json()
    budget_id = data.get('budget_id')  # Budget ID for the record to update
    email = data.get('email')
    budget_type = data.get('budget_type')
    budget_amount = data.get('budget_amt')
    month = data.get('month')
    year = data.get('year')
    description = data.get('description', '')

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        cursor.callproc('UpdateBudget', [budget_id, email, budget_type, budget_amount, month, year, description])
        conn.commit()
        return jsonify({'message': 'Budget updated successfully'}), 200
    except mysql.connector.Error as err:
        conn.rollback()
        print(f"Error: {err}")
        return jsonify({'error': str(err)}), 400
    finally:
        cursor.close()
        conn.close()


@app.route('/delete_budget', methods=['DELETE'])
def delete_budget():
    budget_id = request.args.get('budget_id')

    # Connect to database
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    # Call the stored procedure to delete the budget
    cursor.callproc('DeleteBudget', [budget_id])
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({'message': 'Budget deleted successfully'})


#User Profile
@app.route('/api/user-profile', methods=['POST'])
def user_profile():
    data = request.json
    email = data.get('email')
    
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    if not email:
        return jsonify({"error": "Email is required"}), 400

    query = "SELECT name, password, email, phone FROM user_profile_view WHERE email = %s"
    cursor.execute(query, (email,))
    result = cursor.fetchone()

    if result:
        return jsonify({
            "name": result[0],
            "password": result[1],
            "email": result[2],
            "phone": result[3],
        })
    else:
        return jsonify({"error": "User not found"}), 404

# Fetch All Users
@app.route('/api/users', methods=['GET'])
def fetch_all_users():
    try:
        # Connect to the database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Query to fetch all user data
        query = """
        SELECT 
            User_ID, name, email, password, phone, is_admin, created_at, last_login 
        FROM 
            user
        """
        cursor.execute(query)
        results = cursor.fetchall()

        # Define the column names based on the user table
        columns = ['User_ID', 'name', 'email', 'password', 'phone', 'is_admin', 'created_at', 'last_login']

        # Convert results to a list of dictionaries
        users = [dict(zip(columns, row)) for row in results]

        # Close the connection
        cursor.close()
        conn.close()

        return jsonify(users)
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": "Failed to fetch users"}), 500

# Fetch All Income
@app.route('/api/income', methods=['GET'])
def fetch_all_income():
    try:
        # Connect to the database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Query to fetch all income data
        query = """
        SELECT 
            income_id, user_id, income_amt, income_type, month, year, updated_at
        FROM 
            income
        """
        cursor.execute(query)
        results = cursor.fetchall()

        # Define the column names for income table
        columns = ['income_id', 'user_id', 'income_amt', 'income_type', 'month', 'year', 'updated_at']

        # Convert results to a list of dictionaries
        income_data = [dict(zip(columns, row)) for row in results]

        # Close the connection
        cursor.close()
        conn.close()

        return jsonify(income_data)
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": "Failed to fetch income data"}), 500


# Fetch All Deleted Income
@app.route('/api/deleted-income', methods=['GET'])
def fetch_all_deleted_income():
    try:
        # Connect to the database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Query to fetch all deleted income data
        query = """
        SELECT 
            income_id, income_amt, income_type, month, year, last_updated_at, user_id, deleted_at
        FROM 
            deleted_income
        """
        cursor.execute(query)
        results = cursor.fetchall()

        # Define the column names for deleted_income table
        columns = ['income_id', 'income_amt', 'income_type', 'month', 'year', 'last_updated_at', 'user_id', 'deleted_at']

        # Convert results to a list of dictionaries
        deleted_income_data = [dict(zip(columns, row)) for row in results]

        # Close the connection
        cursor.close()
        conn.close()

        return jsonify(deleted_income_data)
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": "Failed to fetch deleted income data"}), 500

# Expense Related 
@app.route('/api/budgets', methods=['GET'])
def get_budgets():
    email = request.args.get('email')  # Get email from the query parameters
    month = request.args.get('month')
    year = request.args.get('year')
    budget_type = request.args.get('budget_type')  # Filter by budget type

    # Validation
    if not email or not month or not year:
        return jsonify({'message': 'Email, Month, and Year are required.'}), 400

    # Connect to the database
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    try:
        # Get user_id based on email
        cursor.execute("SELECT user_id FROM user WHERE email = %s", (email,))
        user_result = cursor.fetchone()

        if not user_result:
            return jsonify({'message': 'User not found.'}), 404

        user_id = user_result['user_id']

        # Query to fetch budgets based on user_id, month, year, and optionally budget_type
        query = """
            SELECT * FROM budget
            WHERE user_id = %s AND Month = %s AND Year = %s
        """
        
        params = [user_id, month, year]

        if budget_type:
            query += " AND Budget_Type = %s"
            params.append(budget_type)

        cursor.execute(query, tuple(params))
        result = cursor.fetchall()

        if len(result) == 0:
            return jsonify({'message': 'No budgets found for the specified user, month, and year.'}), 404

        return jsonify(result), 200

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'message': 'Internal Server Error'}), 500

    finally:
        cursor.close()
        conn.close()



@app.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.get_json()

    # Extract necessary details from request data
    budget_type = data['budgetType']
    category_name = data['category']
    expense_date = data['date']
    expense_amount = data['amount']
    description = data.get('description', '')
    month = data['month']
    year = data['year']

    # Validation
    if not all([budget_type, category_name, expense_date, expense_amount, month, year]):
        return jsonify({'message': 'All fields are required.'}), 400

    # Connect to the database
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    try:
        # Step 1: Find the budget for the specified budget type, month, and year
        query_budget = """
            SELECT * FROM budget
            WHERE Month = %s AND Year = %s AND Budget_Type = %s
        """
        cursor.execute(query_budget, (month, year, budget_type))
        budget = cursor.fetchone()

        if not budget:
            return jsonify({'message': 'No budget found for the given month, year, and budget type.'}), 404

        budget_id = budget['Budget_ID']

        # Step 2: Check if the category exists for the given budget_id
        query_category = """
            SELECT * FROM category
            WHERE budget_id = %s AND category_name = %s
        """
        cursor.execute(query_category, (budget_id, category_name))
        category = cursor.fetchone()

        if not category:
            # If no category exists, create a new category
            query_create_category = """
                INSERT INTO category (budget_id, category_name)
                VALUES (%s, %s)
            """
            cursor.execute(query_create_category, (budget_id, category_name))
            conn.commit()

            # Fetch the newly created category_id
            category_id = cursor.lastrowid
        else:
            category_id = category['category_id']

        # Step 3: Create the expense record
        query_create_expense = """
            INSERT INTO expense (category_id, expense_amount, expense_date, description)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query_create_expense, (category_id, expense_amount, expense_date, description))
        conn.commit()

        # Step 4: Update the total_expense in category and budget
        query_update_category = """
            UPDATE category SET total_expense = total_expense + %s WHERE category_id = %s
        """
        cursor.execute(query_update_category, (expense_amount, category_id))

        query_update_budget = """
            UPDATE budget SET total_expense = total_expense + %s WHERE Budget_ID = %s
        """
        cursor.execute(query_update_budget, (expense_amount, budget_id))

        conn.commit()

        return jsonify({'message': 'Expense added successfully!'}), 200

    except Error as err:
        print(f"Error: {err}")
        return jsonify({'message': 'Internal Server Error'}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/fetch_expenses', methods=['GET'])
def fetch_expenses():
    email = request.args.get('email')
    month = request.args.get('month')  # Month as VARCHAR
    year = request.args.get('year', type=int)  # Year as INT

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        # First, check if the user exists
        cursor.execute("SELECT user_id FROM user WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404  # Return 404 if user does not exist
        
        user_id = user[0]  # Assuming user_id is the first column in the result

        # Now call the stored procedure
        cursor.callproc('FetchExpenses', (email, month, year))
        expense_data = []

        # Fetch the result
        for result in cursor.stored_results():
            expense_data = result.fetchall()

        if not expense_data:
            return jsonify({"expenses": []}), 200

        return jsonify({"expenses": expense_data}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/api/update-expense', methods=['PUT'])
def update_expense_route():
    try:
        expense_data = request.json
        amount = expense_data['amount']
        budget_type = expense_data['budgetType']
        category = expense_data['category']
        expense_date = expense_data['date']
        description = expense_data['description']
        expense_id = expense_data['expense_id']
        month = expense_data['month']
        year = expense_data['year']

        # Establish connection to the database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        try:
            # Call the stored procedure to update the expense
            cursor.callproc('UpdateExpense', (expense_id, amount, budget_type, category, expense_date, description, month, year))

            # Fetch the result of the stored procedure (if needed)
            for result in cursor.stored_results():
                result_data = result.fetchall()

            # Commit the transaction
            conn.commit()

            # Return success response
            return jsonify({"message": "Expense updated successfully!"}), 200

        except mysql.connector.Error as err:
            conn.rollback()  # Rollback in case of error
            return jsonify({"error": str(err)}), 400

        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/delete_expense', methods=['DELETE'])
def delete_expense():
    expense_id = request.args.get('expense_id')

    # Check if expense_id is provided
    if not expense_id:
        return jsonify({'error': 'Expense ID is required'}), 400

    # Connect to database
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        # Call the stored procedure to delete the expense
        cursor.callproc('DeleteExpense', [expense_id])
        conn.commit()

        # Return success message
        return jsonify({'message': 'Expense deleted successfully'}), 200

    except mysql.connector.Error as err:
        conn.rollback()  # Rollback in case of an error
        return jsonify({'error': f'Error deleting expense: {err}'}), 500

    finally:
        cursor.close()
        conn.close()

# Fetch All Budgets
@app.route('/api/budget', methods=['GET'])
def fetch_all_budget():
    try:
        # Connect to the database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Query to fetch all budget data
        query = """
        SELECT 
            Budget_ID, User_ID, Budget_Type, Budget_Amount, Month, Year, Description, Created_At, Updated_At 
        FROM 
            budget
        """
        cursor.execute(query)
        results = cursor.fetchall()

        # Define the column names based on the budget table
        columns = ['Budget_ID', 'User_ID', 'Budget_Type', 'Budget_Amount', 'Month', 'Year', 'Description', 'Created_At', 'Updated_At']

        # Convert results to a list of dictionaries
        budgets = [dict(zip(columns, row)) for row in results]

        # Close the connection
        cursor.close()
        conn.close()

        return jsonify(budgets)
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": "Failed to fetch budget data"}), 500


# Fetch All Deleted Budgets
@app.route('/api/deleted-budget', methods=['GET'])
def fetch_all_deleted_budget():
    try:
        # Connect to the database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Query to fetch all deleted budget data
        query = """
        SELECT 
            deleted_budget_id, budget_id, user_id, budget_type, budget_amt, month, year, description, created_at, deleted_at
        FROM 
            deleted_budget
        """
        cursor.execute(query)
        results = cursor.fetchall()

        # Define the column names based on the deleted_budget table
        columns = ['deleted_budget_id', 'budget_id', 'user_id', 'budget_type', 'budget_amt', 'month', 'year', 'description', 'created_at', 'deleted_at']

        # Convert results to a list of dictionaries
        deleted_budgets = [dict(zip(columns, row)) for row in results]

        # Close the connection
        cursor.close()
        conn.close()

        return jsonify(deleted_budgets)
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": "Failed to fetch deleted budget data"}), 500

@app.route('/api/expense', methods=['GET'])
def fetch_all_expenses():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        query = "SELECT * FROM expense"
        cursor.execute(query)
        results = cursor.fetchall()
        columns = [col[0] for col in cursor.description]
        expenses = [dict(zip(columns, row)) for row in results]
        cursor.close()
        conn.close()
        return jsonify(expenses)
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to fetch expenses"}), 500

@app.route('/api/deleted-expense', methods=['GET'])
def fetch_all_deleted_expenses():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        query = "SELECT * FROM deleted_expense"
        cursor.execute(query)
        results = cursor.fetchall()
        columns = [col[0] for col in cursor.description]
        deleted_expenses = [dict(zip(columns, row)) for row in results]
        cursor.close()
        conn.close()
        return jsonify(deleted_expenses)
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to fetch deleted expenses"}), 500

@app.route('/api/category', methods=['GET'])
def fetch_all_categories():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        query = "SELECT * FROM category"
        cursor.execute(query)
        results = cursor.fetchall()
        columns = [col[0] for col in cursor.description]
        categories = [dict(zip(columns, row)) for row in results]
        cursor.close()
        conn.close()
        return jsonify(categories)
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to fetch categories"}), 500

@app.route('/api/deleted-category', methods=['GET'])
def fetch_all_deleted_categories():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        query = "SELECT * FROM deleted_category"
        cursor.execute(query)
        results = cursor.fetchall()
        columns = [col[0] for col in cursor.description]
        deleted_categories = [dict(zip(columns, row)) for row in results]
        cursor.close()
        conn.close()
        return jsonify(deleted_categories)
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to fetch deleted categories"}), 500

#Report generation:
# API to calculate total budget
@app.route('/total_budget', methods=['GET'])
def total_budget():
    email = request.args.get('email')
    month = request.args.get('month')  # Month as VARCHAR
    year = request.args.get('year', type=int)  # Year as INT

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        # Step 1: Fetch user_id from the user table based on the email
        cursor.execute("""
            SELECT user_id 
            FROM user 
            WHERE email = %s
        """, (email,))
        user_id_result = cursor.fetchone()

        if user_id_result is None:
            return jsonify({"error": "User not found"}), 404

        user_id = user_id_result[0]

        # Step 2: Fetch total budget amount for the given user, month, and year
        cursor.execute("""
            SELECT SUM(Budget_Amount) 
            FROM budget 
            WHERE User_ID = %s AND month = %s AND Year = %s
        """, (user_id, month, year))

        total_budget = cursor.fetchone()[0] or 0

        return jsonify({"total_budget": str(total_budget)}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        conn.close()


# API to calculate total category expenses
@app.route('/total_category', methods=['GET'])
def total_category():
    email = request.args.get('email')
    month = request.args.get('month')  # Month as VARCHAR
    year = request.args.get('year', type=int)  # Year as INT

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        # Step 1: Fetch user_id from the user table based on the email
        cursor.execute("""
            SELECT user_id 
            FROM user 
            WHERE email = %s
        """, (email,))
        user_id_result = cursor.fetchone()

        if user_id_result is None:
            return jsonify({"error": "User not found"}), 404

        user_id = user_id_result[0]

        # Step 2: Fetch total category expense for the given user, month, and year
        cursor.execute("""
            SELECT SUM(c.total_expense)
            FROM category c
            INNER JOIN budget b ON c.budget_id = b.Budget_ID
            WHERE b.User_ID = %s AND b.month = %s AND b.Year = %s
        """, (user_id, month, year))

        total_category = cursor.fetchone()[0] or 0

        return jsonify({"total_category": str(total_category)}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        # Ensure resources are released
        cursor.close()
        conn.close()


@app.route('/get_income_list', methods=['GET'])
def get_incomes():
    email = request.args.get('email')
    month = request.args.get('month')
    year = request.args.get('year', type=int)

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)  # Use dictionary=True for column names as keys

    try:
        # Fetch user_id
        cursor.execute("SELECT user_id FROM user WHERE email = %s", (email,))
        user_id_result = cursor.fetchone()
        if user_id_result is None:
            return jsonify({"error": "User not found"}), 404

        user_id = user_id_result['user_id']

        # Fetch incomes
        cursor.execute("""
            SELECT income_id, income_amt, income_type, month, year, updated_at
            FROM income 
            WHERE user_id = %s AND month = %s AND year = %s
        """, (user_id, month, year))
        incomes = cursor.fetchall()

        return jsonify({"incomes": incomes}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400

    finally:
        cursor.close()
        conn.close()


@app.route('/get_budget_list', methods=['GET'])
def get_budget_list():
    email = request.args.get('email')
    month = request.args.get('month')
    year = request.args.get('year', type=int)

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    try:
        # Fetch user_id
        cursor.execute("SELECT user_id FROM user WHERE email = %s", (email,))
        user_id_result = cursor.fetchone()
        if user_id_result is None:
            return jsonify({"error": "User not found"}), 404

        user_id = user_id_result['user_id']

        # Fetch budgets
        cursor.execute("""
            SELECT Budget_ID, Budget_Type, Budget_Amount, month, Year, Description, total_expense
            FROM budget
            WHERE User_ID = %s AND month = %s AND Year = %s
        """, (user_id, month, year))
        budgets = cursor.fetchall()

        return jsonify({"budgets": budgets}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/get_category_list', methods=['GET'])
def get_categories():
    email = request.args.get('email')
    month = request.args.get('month')
    year = request.args.get('year', type=int)

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    try:
        # Fetch user_id
        cursor.execute("SELECT user_id FROM user WHERE email = %s", (email,))
        user_id_result = cursor.fetchone()
        if user_id_result is None:
            return jsonify({"error": "User not found"}), 404

        user_id = user_id_result['user_id']

        # Fetch budget IDs for the user
        cursor.execute("""
            SELECT Budget_ID FROM budget
            WHERE User_ID = %s AND month = %s AND Year = %s
        """, (user_id, month, year))
        budget_ids = [row['Budget_ID'] for row in cursor.fetchall()]

        if not budget_ids:
            return jsonify({"categories": []}), 200

        # Fetch categories linked to those budgets
        format_strings = ','.join(['%s'] * len(budget_ids))
        cursor.execute(f"""
            SELECT category_id, category_name, total_expense
            FROM category
            WHERE budget_id IN ({format_strings})
        """, budget_ids)
        categories = cursor.fetchall()

        return jsonify({"categories": categories}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/get_expense_list', methods=['GET'])
def get_expenses():
    email = request.args.get('email')
    month = request.args.get('month')
    year = request.args.get('year', type=int)

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    try:
        # Fetch user_id
        cursor.execute("SELECT user_id FROM user WHERE email = %s", (email,))
        user_id_result = cursor.fetchone()
        if user_id_result is None:
            return jsonify({"error": "User not found"}), 404

        user_id = user_id_result['user_id']

        # Fetch budget IDs for the user
        cursor.execute("""
            SELECT Budget_ID FROM budget
            WHERE User_ID = %s AND month = %s AND Year = %s
        """, (user_id, month, year))
        budget_ids = [row['Budget_ID'] for row in cursor.fetchall()]

        if not budget_ids:
            return jsonify({"expenses": []}), 200

        # Fetch category IDs linked to those budgets
        format_strings = ','.join(['%s'] * len(budget_ids))
        cursor.execute(f"""
            SELECT category_id FROM category
            WHERE budget_id IN ({format_strings})
        """, budget_ids)
        category_ids = [row['category_id'] for row in cursor.fetchall()]

        if not category_ids:
            return jsonify({"expenses": []}), 200

        # Fetch expenses linked to those categories
        format_strings = ','.join(['%s'] * len(category_ids))
        cursor.execute(f"""
            SELECT expense_id, expense_amount, expense_date, description
            FROM expense
            WHERE category_id IN ({format_strings})
        """, category_ids)
        expenses = cursor.fetchall()

        return jsonify({"expenses": expenses}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)
