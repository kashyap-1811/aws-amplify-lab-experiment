# AWS Amplify Lab Experiment (TodoFlow)

TodoFlow is a lightweight single-page Todo application built with plain HTML, CSS, and JavaScript.  
This project now also includes a built-in AWS API Gateway test panel for GET and POST endpoints.

## Features

- Add, complete, filter, and delete todos
- Clear all completed todos
- Persistent todo storage in browser `localStorage` (`todo-flow-items`)
- AWS API Gateway integration panel:
  - Call a GET endpoint
  - Call a POST endpoint with JSON body
  - View formatted API response and request status
  - Persist API settings in `localStorage` (`todo-flow-api-config`)

## Project Structure

- `/home/runner/work/aws-amplify-lab-experiment/aws-amplify-lab-experiment/index.html` – app markup
- `/home/runner/work/aws-amplify-lab-experiment/aws-amplify-lab-experiment/style.css` – app styling
- `/home/runner/work/aws-amplify-lab-experiment/aws-amplify-lab-experiment/script.js` – app logic

## Run Locally

No build step is required.

1. Open `/home/runner/work/aws-amplify-lab-experiment/aws-amplify-lab-experiment/index.html` in a browser.
2. Start using the TodoFlow UI.

## AWS API Gateway Integration Usage

In the **AWS API Gateway** section of the app:

### GET

1. Enter your GET endpoint URL (default value is prefilled).
2. Click **Call GET**.
3. Check the response in the response panel.

### POST

1. Enter your POST endpoint URL.
2. Enter valid JSON in **POST body (JSON)** (example: `{"message":"Hello from TodoFlow"}`).
3. Click **Call POST**.
4. Check status and response output.

## Notes

- If requests fail due to CORS, enable the required CORS headers on API Gateway/Lambda response.
- API endpoint settings are saved in browser storage per device/browser.