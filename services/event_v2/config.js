export const config = {
  "topology": {
    "nat": true
  },
  "clickhouse": {
    "host": "172.28.0.7",
    "port": 8123,
    "database": "default",
    "username": "default",
    "password": "qqq"
  },
  "api": {
    "internal": "http://172.28.0.2/internal"
  },
  "hw": {
    "beward": {
      "port": 45450
    },
    "beward_ds": {
      "port": 45451
    },
    "qtech": {
      "port": 45452
    },
    "is": {
      "port": 45453
    },
    "hikvision": {
      "port": 45454
    },
    "akuvox": {
      "port": 45455
    },
    "rubetek": {
      "port": 45456
    },
    "sputnik": {
      "port": 45457,
      "apiEndpoint": "/webhook/sputnik"
    },
    "omny": {
      "port": 45458,
      "apiEndpoint": "/webhook/omny"
    }
  }
}
