# Manufacturing Data & Machine Learning Layer (MDML)


The Manufacturing Data & Machine Learning Layer was built to support scientists and their research efforts in the newly renovated Materials Engineering Research Facility (MERF). The MDML provides scientists with real-time computing, monitoring dashboards, and data storage. In order to use these features, data from an experiment must be streamed through the MDML via the provided Python client or from any other programming langauge with an MQTT client. We strongly recommend the Python client as it abstracts away the messy details of sending data with the MQTT protocol.


# Getting Started

Please reach out to [Santanu Chaudhuri and Jakob Elias](mailto:manufacturing@anl.gov?cc=jelias@anl.gov;schaudhuri@anl.gov&subject=MDML) to gain access to the MDML.


## Creating a configuration file

Every experiment run through the MDML needs to first have a configuration file. This serves to give the MDML context to your data and provide meaningful metadata for your experiments, processes, and data-generating devices. Information in the configuration file should answer questions that the data itself does not. Things like, what units are the data in, what kind of device generated the data, or was an analysis done before sending your data to the MDML? Providing as much information as possible not only increases the data's value for scientific purposes but also minimizes future confusion when you or another researcher want to use the data.

More information about the configuration file can be found in the [Python client documentation]().


## Streaming data


* ### Python Client

    A [python client](https://test.pypi.org/project/mdml-client/) has been created to simplify sending data through the MDML. The link contains the documentation for using the MDML's Python package.


* ### Labview's Python Integration Toolkit

    If using LabView, the [Python Integration Toolkit add-on](http://docs.enthought.com/python-for-LabVIEW/) can be [purchased](http://sine.ni.com/nips/cds/view/p/lang/en/nid/213990) to stream data directly from LabView.


* ### MQTT client
 
    If using the python client is not possible, you will need to find an MQTT client in your programming language of choice in order to connect and send messages to the MDML. Follow this [link for instructions](http://merf.egs.anl.gov/instructions_without_python.html) on the format of MDML's MQTT messages. 


    

## Using the MDML 


* ### Monitor
    The MDML runs a Grafana instance for creating real-time dashboards using a GUI and writing no code.


* ### Analyze
    The MDML gives access to [DLHub](https://www.dlhub.org/) and [FuncX](https://funcx.readthedocs.io/en/latest/) to provide on-demand computing. To perform and receive analysis results in real-time, you must select a machine learning model already hosted on DLHub or create a custom function and register it with FuncX. 
<a href="#analysis_documentation">Go to the Analysis documentation</a>


* ### Share
    Upon ending an experiment, the MDML archives all metadata, device data files, and images from the experiment. A tar file can be downloaded through the MDML object store interface [here](https://merf.egs.anl.gov:9000). Download this file or use the link provided through the interface for easy sharing.


## Software Stack

* ### Eclipse Mosquitto
    The MDML uses the MQTT protocol for passing data between machines. Eclipse Mosquitto, a message broker, is responsible for sending data using this protocol. MQTT uses a publisher/subscriber model. To explain, a subscriber connects to the message broker and provides a topic string for receiving messages. When a publisher connects and publishes (sends) data, they also supply a topic string for the message. Any subscriber that has connected to the broker will receive the message from the publisher as long as their supplied topic strings are the same. Each message sent through MQTT consists of two parts supplied by the publisher: a *topic* (already mentioned) and a *payload* which contains the actual data. Topic strings are hierarchical in nature, for example **MERF/Experiment/Device**. MERF and Experiment are the first and second levels in this topic's hierarchy. Wildcards (#) can be included to receive all messages. For example, a subscriber on topic **MERF/Experiment/#** would receive all messages in which the producer's topic string starts with **MERF/Experiment/**.
    

* ### InfluxDB
    InfluxDB is a time series database. Measurements are created for each device listed in your configuration. For each message sent to the MDML, InfluxDB stores the device's data as one row in a measurement. If one of the headers in the device's data is `time` (case-sensitive), InfluxDB uses this as the timestamp associated with the entry. If `time` is not supplied, the timestamp used will be the time InfluxDB logs the entry. If supplying a `time` variable, it must be unix time in nanoseconds.
    
    Another important thing to note about InfluxDB is the concept of fields and tags. In terms of storing data, they are the same. However, behind the scenes, InfluxDB increases the performance of conditional queries when certain variables are inserted as tags instead of fields. For example, the query `"SELECT temperature FROM DEVICE_A WHERE room = 202"` will return faster if `room` is stored as a tag. This holds true for any variable you wish to use in a `WHERE` statment. You can specify which variables are stored as tags using the field `influx_tags` in your configuration file.


* ### Grafana
    Grafana is the MDML's real-time dashboard solution. Dashboards can be created by the user to display any data they deem important. It was chosen to give scientists the fexibility to tailor dashboards to their needs and provide real-time monitoring of their experiments. When data is streamed to the MDML it is stored in InfluxDB and subsequently accessed there by Grafana.

    Since Grafana is used to monitor time series data, graphs have an X-axis displaying time and a Y-axis for the queried variables. It is possible to create graphs where the X-axis is not time. To do this, data must be stored in InfluxDB in a particular format. Since this is done automatically by the MDML, your configuration may need to be editted. An example is provided [here]() to help with this problem.


<div id="config_documentation"></div>
## Configuration Documentation
The configuration file must be a [valid JSON file](https://en.wikipedia.org/wiki/JSON). It consists of two parts, an `experiment` section and a `devices` section. The experiment section is for general experiment notes and the list of devices that will generate data. The devices section contains an entry for each device listed in the experiment section. In each section, there are required fields and optional fields that control the MDML's behavior while streaming data. Furthermore, it is possible to create any additional fields you wish as long as the field's name is not already used by a required or optional field. Below is an in depth description of the configuration file.

### Experiment

#### Required Fields: 
     
* experiment_id
    - Experiment ID provided by the MDML administrators
* experiment_notes
    - Any important notes about your experiment that you would like to remain with the data 
* experiment_devices
    - A list of devices that will be generating and sending data. These will be described in the `Devices` section

#### Optional Fields:

* experiment_run_id
    * Experiment run ID (Defaults to 1 and increases for each new experiment) This is different than `experiment_id`.

###     Devices

#### Required Fields:

* device_id
    * Identification string for the device. __MUST__ match a device listed in the experiment section
* device_name
    * Full name of the device
* device_output
    * Explanation of what data the device is outputting
* device\_output\_rate
    * The rate (in hertz) that this sensor will be generating data (If the rate during your experiment may vary, please use the fastest rate)
* device\_data\_type
    * Type of data being generated. Must be "text/numeric", "vector", or "image"
* device_notes
    * Any other relevant information to provide that has not been listed
* headers
    * A list of headers to describe the data that will be sent
* data_types
    * A list of data types for each value (__MUST__ correspond to the `headers` field)
* data_units
    * A list of the units for each value (__MUST__ correspond to the `headers` field)

#### Optional Fields:

* melt_data - Contains more data on how to melt the data (see the melting data section below) 
    * keep
        * List of variables to keep the same (must have been listed in the `headers` field)
    * var_name
        * Name of the new variable that is created with all the values from headers that are not included in `keep`
    * var_val
        * Name of the new variable that is created with the values corresponding to the original headers 
* influx_tags
    * List of variables that should be used as tags - __MUST__ correspond to values in the `headers` field (Tags are specific to InfluxDB. See the Software Stack section below for details.)


###     Experiment Configuration Example
```
{
    "experiment": {
      "experiment_id": "FSP",
      "experiment_notes": "Flame Spray Pyrolysis Experiment",
      "experiment_devices": [
        "OES",
        "DATA_LOG",
        "PLIF"
      ]
    },
    "devices": [
      {
        "device_id": "OES",
        "device_name": "ANDOR Kymera328",
        "device_output": "2048 intensity values in the 250-700nm wavelength range",
        "device_output_rate": 0.01,
        "device_data_type": "text/numeric",
        "device_notes": "Points directly at the flame in 8 different locations",
        "headers": [
          "time",
          "Date",
          "Channel",
          "188.06",
          "188.53"
        ],
        "data_types": [
          "time",
          "date",
          "numeric",
          "numeric",
          "numeric"
        ],
        "data_units": [
          "nanoseconds",
          "date",
          "number",
          "dBm/nm",
          "dBm/nm"
        ],
        "melt_data": {
          "keep": [
            "time",
            "Date",
            "Channel",
          ],
          "var_name": "wavelength",
          "var_val": "intensity"
        },
        "influx_tags": ["Channel", "wavelength"]
      },
      {
        "device_id": "DATA_LOG",
        "device_name": "ANDOR Kymera328",
        "device_output": "2048 intensity values in the 250-700nm wavelength range",
        "device_output_rate": 0.9,
        "device_data_type": "text/numeric",
        "device_notes": "Points directly at the flame in 8 different locations",
        "headers": [
          "time",
          "Sample #",
          "Date",
          "SOL#",
          "Vol remaining [ml]",
          "Exhaust Flow",
          "Pressure"
        ],
        "data_types": [
          "time",
          "numeric",
          "date",
          "numeric",
          "numeric",
          "numeric",
          "numeric"
        ],
        "data_units": [
          "nanoseconds",
          "number",
          "date",
          "number",
          "milliliters",
          "liters/hour",
          "atm"
        ]
      },
      {
        "device_id": "PLIF",
        "device_name": "Planar Laser Induced Fluorescence",
        "device_output": "Image of flames showing specific excited species.",
        "device_output_rate": 10,
        "device_data_type": "image",
        "device_notes": "Points down, directly at the flame",
        "headers": [
          "PLIF"
        ],
        "data_types": [
          "image"
        ],
        "data_units": [
          "image"
        ]
      }
    ]
  }
```


<div id="analysis_documentation"></div>

## Analysis Documentation

Real-time analysis via the MDML is accomplished through FuncX. FuncX was created by a team at Argonne. 

Analysis run via the MDML can be accomplished by sending a 

