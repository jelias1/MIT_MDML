## Using the MDML without the Python client


* ### Connecting to the broker
    A connection to the broker can be made from any programming language with an MQTT client library. In python, the paho-mqtt library makes this connection. For connecting, use the host IP address of 146.137.10.50 and the port 1883.

* ### MDML's MQTT Message Format
Each message consists of two parts: a topic and a payload.

    * #### Topic
            MDML/[Experiment]/[Action]/[Device]
        The structure of your topic should follow the format above where [Experiment], [Action], and [Device] are replaced with real values. __This format is essential__ so that collisions are avoided in the topic space and ensure that messages are properly routed. The experiment string you use will be given to you by an MDML admin. Acceptable action strings are listed below. Device strings are decided by the user and __MUST__ remain consistent throughout an experiment. Topic strings are __case-sensitive__.
        
        **`Actions`:** 
    
          * CONFIG - Initializing experiment variables (data headers)
          * DATA - Used when sending data
          * RESET - Reset the system's state for a new experiment

    * #### Payload
        The payload of each message must be a string. Stringifying dictionaries/objects to use as message payloads is perfectly acceptable. Each of the three actions listed above requires a specific payload message. Each of message syntax is explained below.

        * ##### CONFIG
            When sending a message with the action `CONFIG`, the device value in the topic string can be omitted because the configuration is stored at the experiment level. This configuration will be saved as metadata along with any data generated during the experiment. It is in your best interest to carefully create a configuration so that any necessary metadata will be included. The amount of detail included here will contribute to the usefulness and longevity of the dataset. Imagine you are a researcher trying to fully understand the datasets produced by this experiment. Below is an example configuration for an experiment using 2 devices. A breakdown of each field follows the example.

                {
                    'experiment': {
                        'experiment_id': 'FLAME',
                        'experiment_notes': 'First run',
                        'experiment_devices': ['DEVICE_A', 'DEVICE_B']
                    },
                    'devices': [
                        {
                            'device_id': 'DEVICE_A',
                            'device_name': 'ANDOR Kymera328',
                            'device_version': '1.2',
                            'device_output': '2048 intensity values in the 250-700nm wavelength range',
                            'device_output_rate': 10,
                            'device_data_type': 'text/numeric',
                            'device_notes': 'Points directly at the flame in 8 different locations',
                            'headers': ["header 1", "header 2", ...],
                            'data_types': ["string", "float", ...],
                            'data_units': ["nanometer", "text", ...],
                            'save_tsv': true
                        },
                        ...
                        {
                            'device_id': 'DEVICE_Z'
                            'device_name': 'Scanning Mobility Particle Sizer',
                            'device_version': '5.3',
                            'device_output': 'Particle diameter size distribution',
                            'device_output_rate': 0.1,
                            'device_data_type': 'text/numeric',
                            'device_notes': 'Particles are split off from the exhaust of the furnace',
                            'headers': ["header 1", "header 2", ...],
                            'data_types': ["float", "string", ...],
                            'data_units': ["text", "count", ...],
                            'save_tsv': true
                        }
                    ]
                }
            * `experiment` - List of details about the experiment
              * `experiment_id` - Identifier for this experiment - used internally by the MDML
              * `experiment_notes` - Any miscellaneous notes regarding the experiment
              * `experiment_devices` - List of device IDs used in the experiment
            * `devices` - List of devices that are sending data to MDML
              * `device_id` - Identifier for the device - used internally by the MDML
              * `device_name` - Technical name of the device/sensor that is outputting data
              * `device_version` - Current version of the device
              * `device_output` - Description of the output data
              * `device_output_rate` - Rate at which data is output (in hertz)
              * `device_data_type` - One of two values: 'text/numeric' or 'image'
              * `device_notes` - Any extra notes that the user would like to include
              * `headers` - List of data headers
              * `data_types` - List of the data type to be sent
              * `data_units` - Units associated with the data (seconds, nanometers, text, count, etc.)
              * `save_tsv` - Boolean value (true/false) to save the data to a tab separated values file (tarball of all device data files will be output upon RESET command)

        * ##### DATA
                {
                    'data': [Actual data string],
                    'data_delimiter': [Delimiter used in the data string],
                    'data_type': [see data_type options]
                    'influx_measurement': [InfluxDB measurement name],
                }
            * `data` - The actual data generated to be stored, analyzed, etc.
            * `data_delimiter` - (optional) Describes how internal MDL functions will split the message's `data` and `data_headers` strings. If omitted, the system assumes the data string is only one value and is stored as such.
            * `data_type` - (optional) one of these values: "text/numeric", "image" (defaults to "text/numeric")
            * `influx_measurement` - (optional) A string to create a measurement in InfluxDB that the data will be stored under. This string will automatically be prefixed with the experiment value used in the topic string. If omitted, the data will not be stored in InfluxDB.


        * ##### RESET
            Sending this reset message will archive any files output during the experiment. It also performs some behind the scenes housekeeping to make sure all data message have made it fully through the pipeline.
                {
                    'reset': 1
                }
  
* ### Starting an experiment
    In order to begin a new experiment, send a message with the action `CONFIG` to the MDML's MQTT message broker. Make sure to use the experiment ID you received from an MDML admin! 
    
* ### During an experiment
    Send as many messages with the `DATA` action as you feel like. 

* ### Stopping an experiment
  It is required to explicitly end an experiment. To do so, send a message with the `RESET` action along with your experiment ID.


* ### Receiving updates from the MDML for analysis results or debugging.
  Any updates that the MDML is capable of providing to the researcher will be published to the same broker that data is sent through. To receive these updates, create an MQTT subscriber client that listens to the MDML host on port 1883 for the topic 'MDML_DEBUG/[YOUR EXPERIMENT ID]'. 