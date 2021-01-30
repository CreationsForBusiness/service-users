# Database for Service Users

## Models

### Users

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| username | String | yes | username of user |
| mail | Array[Mail] | yes | Array of emails registered by user |
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

## Schemas

### Mail


| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| mail | String | yes | email address of user  |
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
| status | Boolean | yes | status of this Password |
| created | Date | yes | Date of creation |
| updated | Date | yes | Date of update status |