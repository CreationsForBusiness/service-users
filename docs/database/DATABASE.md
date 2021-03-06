# Database for Service Users

## Models

### Users

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| email | String | yes | email of user |
| login | Login | yes | Array of emails registered by user |
| status | Boolean | yes | Status of user |
| state  | String | yes | state of account |
| ip_registered | Array[IP] | yes | Ip registered by user |

### Apps

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| code | String | yes | Application code |
| name | String | yes | Application name |
| status | Boolean | yes | Status of application |

### Logs

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| user | Object Id | yes | Id of user |
| action | String | yes | Actionable by user |
| app | String | yes | App code |
| ip | String | yes | Ip source of action |
| date | Date | yes | Date of action |

### Tokens
| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| code | String| yes | Code of token |
| state | String | yes | State of token |
| ip | Object | yes | Ip of token |
| status | Boolean | yes | Active or inactive |
| date | Date | yes | Date of creation |


## Schemas

### Login


| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| type | Array[Type] | yes | Type of register |
| app | Array [App]  | yes | App registered by email |
| status | Boolean | yes | Status of email  |
| created | Date  | yes | Date of creation  |
| updated | Date | yes | Date of update status |


### IP

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| ip | String | yes | Ip source |
| type | String | yes | Type of action by this IP |
| status | Boolean | yes | status of this IP |
| created | Date | yes | Date of creation |
| updated | Date | yes | Date of update status |

### App

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| code | String | yes | Code of app  |
| status | Boolean | yes | status of this App |
| created | Date | yes | Date of creation |
| updated | Date | yes | Date of update status |

### Type

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| code | String | yes | Type of login  |
| password | Array[Password] | no | Passwords used by user |
| status | Boolean | yes | status of this Password |
| created | Date | yes | Date of creation |
| updated | Date | yes | Date of update status |

### Password

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| sha | String | yes | Password encrypted of user |
| code | String | yes | Code of creation of this password  |
| type | String | yes | Type for creation of password |
| status | Boolean | yes | status of this Password |
| created | Date | yes | Date of creation |
| updated | Date | yes | Date of update status |