import http.server
import socketserver
import json
import os
import socket
import threading
import subprocess
# Custom HTTP request handler

# Function to get signal strength
def get_signal_strength():
    try:
        # Run `iwconfig` to get Wi-Fi details (Linux-specific)
        result = subprocess.run(['iwconfig'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        output = result.stdout

        # Parse the output to find signal strength
        if "Signal level" in output:
            for line in output.split("\n"):
                if "Signal level" in line:
                    return line.strip()  # Return the line with signal info
        return "Signal strength information not available."
    except Exception as e:
        return f"Error retrieving signal strength: {str(e)}"

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/update_data':
            # Optionally handle updating data here if needed
            self.send_response(302)
            self.send_header('Location', '/parts.html')  # Redirect to parts.html
            self.end_headers()
        if self.path == '/signal_strength':
            # Serve signal strength as JSON
            signal_strength = get_signal_strength()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"signal_strength": signal_strength}).encode('utf-8'))
        else:
            # Serve JSON, HTML, CSS, JavaScript, and image files
            if self.path.endswith(('.html', '.css', '.js', '.json', '.jpg', '.jpeg', '.png', '.gif')):
                super().do_GET()  # Serve the requested file
            else:
                try:
                    if self.path == '/':
                        self.path = './parts.html'  # Serve parts.html by default
                    # Check if the file exists
                    if os.path.exists(self.path):
                        # Serve the requested file
                        with open(self.path, 'rb') as file:
                            self.send_response(200)
                            # Set content type based on file extension
                            if self.path.endswith('.html'):
                                self.send_header('Content-type', 'text/html')
                            elif self.path.endswith('.css'):
                                self.send_header('Content-type', 'text/css')
                            elif self.path.endswith('.js'):
                                self.send_header('Content-type', 'text/javascript')
                            elif self.path.endswith('.json'):
                                self.send_header('Content-type', 'application/json')
                            elif self.path.endswith(('.jpg', '.jpeg')):
                                self.send_header('Content-type', 'image/jpeg')
                            elif self.path.endswith('.png'):
                                self.send_header('Content-type', 'image/png')
                            elif self.path.endswith('.gif'):
                                self.send_header('Content-type', 'image/gif')
                            self.end_headers()
                            self.wfile.write(file.read())
                    else:
                        # If the file doesn't exist, send a 404 response
                        self.send_response(404)
                        self.send_header('Content-type', 'text/html')
                        self.end_headers()
                        with open('404.shtml', 'rb') as file:
                            self.wfile.write(file.read())
                except IOError:
                    self.send_error(500, 'Internal Server Error')


    def do_PUT(self):
        content_length = int(self.headers['Content-Length'])
        updated_data = self.rfile.read(content_length)
        with open('parts_data.json', 'w') as f:
            f.write(updated_data.decode('utf-8'))
        self.send_response(200)
        self.end_headers()


# Function to handle incoming data and send a response
def handle_data(data, client_socket):
    # Process the incoming data
    processed_data = process_data(data)
    # Prepare a response
    response_data = prepare_response(processed_data)
    # Send the response back to the client
    client_socket.sendall(response_data.encode("utf-8"))
    print("Response sent.")
    # Close the connection
    client_socket.close()

# Function to process incoming data (you can modify this according to your needs)
def process_data(data):
    # For demonstration purposes, let's just return the received data
    return data

# Function to prepare a response (you can modify this according to your needs)
def prepare_response(data):
    # For demonstration purposes, let's just return a simple message
    return "Response: Data received and processed successfully."

# Create an instance of the HTTP server
http_handler_object = MyHttpRequestHandler
HTTP_HOST = '0.0.0.0'  # Listen on all available interfaces
HTTP_PORT = 80
http_server = socketserver.TCPServer((HTTP_HOST, HTTP_PORT), http_handler_object)

# Start the HTTP server in a separate thread
http_thread = threading.Thread(target=http_server.serve_forever)
http_thread.daemon = True  # Make sure the thread is terminated when the main program exits
http_thread.start()
print(f"HTTP Server started at port {HTTP_PORT}")

# Create a socket object for the raw server
SOCKET_HOST = '0.0.0.0'  # Listen on all available interfaces
SOCKET_PORT = 9000
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Bind the socket to the host and port
server_socket.bind((SOCKET_HOST, SOCKET_PORT))

# Start listening for incoming connections
server_socket.listen(5)
print(f"Raw Socket Server listening on {SOCKET_HOST}:{SOCKET_PORT}")

# Accept incoming connections in a loop
while True:
    client_socket, client_address = server_socket.accept()
    print(f"Connection from {client_address}")

    # Receive data from the client
    data = client_socket.recv(1024).decode("utf-8")
    print(f"Received data: {data}")

    # Handle the received data in a separate thread
    threading.Thread(target=handle_data, args=(data, client_socket)).start()
