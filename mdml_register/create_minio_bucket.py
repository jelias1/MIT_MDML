import os
import sys
import subprocess

# Grab arguments
exp_ID = sys.argv[1]

def create_experiment(experiment_id):
    # Ensure upper case
    experiment_id = experiment_id.upper()
    # Create policy for access to MinIO files from this experiment 
    create_policy(experiment_id)
    # Create access group in MinIO for this experiment
    create_minio_group(experiment_id)
    # Create bucket
    create_experiment_bucket(experiment_id)

def create_policy(experiment_id):
    # Getting MinIO policy directory
    policy_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), "MinIO_policies")
    # Get policy template
    template_file = os.path.join(policy_dir, "experiment_template.json")
    # Read template
    with open(template_file, 'r') as tmp:
        policy_template = tmp.read()
    # Bucket name
    bucket_name = 'mdml-' + experiment_id.lower()
    # Replace bucket name and experiment ID
    policy_template = policy_template.replace('REPLACE_BUCKET_NAME', bucket_name)
    # Write policy to file
    new_policy_file = os.path.join(policy_dir, "readwrite_"+experiment_id+".json")
    with open(new_policy_file, 'w') as new_file:
        new_file.write(policy_template)
    print(new_policy_file)
    # Create policy with MinIO client 
    subprocess.call(["mc", "admin", "policy", "add", "myminio", "readwrite_"+experiment_id, new_policy_file])

def create_minio_group(experiment_id):
    # Create group
    subprocess.call(["mc", "admin", "group", "add", "myminio", "readwrite_"+experiment_id, "admin"])
    # Attach policy to group
    subprocess.call(["mc", "admin", "policy", "set", "myminio", "readwrite_"+experiment_id, "group=readwrite_"+experiment_id])

def create_experiment_bucket(experiment_id):
    # Create bucket
    subprocess.call(["mc", "mb", "--ignore-existing", "myminio/mdml-"+experiment_id.lower()])

# Creating experiment
create_experiment(exp_ID)