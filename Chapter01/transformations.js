// TexturedQuad.js (c) 2012 matsuda and kanda
// Vertex shader program

//显示效果有问题，在IE浏览器下显示效果与LearnOpenGL一致，但是在Chrome与FireFox下显示效果不佳
var VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  "attribute vec2 a_TexCoord;\n" +
  "varying vec2 v_TexCoord;\n" +
  'uniform mat4 u_ModelMatrix;\n' +
  "void main() {\n" +
  "  gl_Position = u_ModelMatrix * a_Position;\n" +
  "  v_TexCoord = a_TexCoord;\n" +
  "}\n";

// Fragment shader program
var FSHADER_SOURCE =
  "#ifdef GL_ES\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "uniform sampler2D u_Sampler1;\n" +
  "uniform sampler2D u_Sampler2;\n" +
  "varying vec2 v_TexCoord;\n" +
  "void main() {\n" +
  "  gl_FragColor = mix(texture2D(u_Sampler1, v_TexCoord) , texture2D(u_Sampler2, v_TexCoord) , 0.2);\n" +
  "}\n";

var ANGLE_STEP = 45.0;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  // Set the vertex information
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log("Failed to set the vertex information");
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.2, 0.3, 0.3, 1);

  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Current rotation angle
  var currentAngle = 0.0;
  // Model matrix
  var modelMatrix = new Matrix4();


    // Start drawing
  var tick = function() {
    currentAngle = animate(currentAngle); // Update the rotation angle
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix); // Draw the triangle
    requestAnimationFrame(tick, canvas); // Request that the browser ?calls tick
  };
  tick();


  // Set texture
  if (!initTextures(gl, n)) {
    console.log("Failed to intialize the texture.");
    return;
  }
}

function initVertexBuffers(gl) {
  var verticesTexCoords = new Float32Array([
    // Vertex coordinates, texture coordinate
    -0.5, 0.5, 0.0, 1.0,
    -0.5,-0.5, 0.0, 0.0,
    0.5, 0.5, 1.0, 1.0,
    0.5,-0.5,1.0,0.0
  ]);
  var n = 4; // The number of vertices

  // Create the buffer object
  var vertexTexCoordBuffer = gl.createBuffer();
  if (!vertexTexCoordBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

  var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(a_Position); // Enable the assignment of the buffer object

  // Get the storage location of a_TexCoord
  var a_TexCoord = gl.getAttribLocation(gl.program, "a_TexCoord");
  if (a_TexCoord < 0) {
    console.log("Failed to get the storage location of a_TexCoord");
    return -1;
  }
  // Assign the buffer object to a_TexCoord variable
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  gl.enableVertexAttribArray(a_TexCoord); // Enable the assignment of the buffer object

  return n;
}

function initTextures(gl, n) {
  var texture1 = gl.createTexture(); // Create a texture object
  var texture2 = gl.createTexture();
  if (!texture1 || !texture2) {
    console.log("Failed to create the texture object");
    return false;
  }

  // Get the storage location of u_Sampler
  var u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  var u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2");

  if (!u_Sampler1 || !u_Sampler2) {
    console.log(
      "Failed to get the storage location of u_Sampler1 Or u_Sampler2"
    );
    return false;
  }
  var image1 = new Image(); // Create the jpg image object
  var image2 = new Image(); // Create the png image object
  if (!image1 || !image2) {
    console.log("Failed to create the image object");
    return false;
  }

  //   image1.onload = function(){ loadTexture(gl, n, texture1, texture2 ,  u_Sampler1 , u_Sampler2, image1 , image2); };
  image1.src = "../Data/container.jpg";

  image2.onload = function() {
    loadTexture(gl,n,texture1,texture2,u_Sampler1,u_Sampler2,image1,image2);};
  image2.src = "../Data/awesomeface.png";

  return true;
}

function loadTexture(
  gl,
  n,
  texture1,
  texture2,
  u_Sampler1,
  u_Sampler2,
  image1,
  image2
) {
  if (!image1.complete || !image2.complete) {
    console.log("=================");
    return;
  }

  console.log("image1 , width: " + image1.width + " heigh: " + image1.height);
  console.log("image2 , width: " + image2.width + " heigh: " + image2.height);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture1);

  // set texture wrapping to GL_REPEAT (default wrapping method)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler1, 0);

  //Enable texture unit1
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture2);

  // set texture wrapping to GL_REPEAT (default wrapping method)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler2, 1);

//   gl.clear(gl.COLOR_BUFFER_BIT); // Clear <canvas>

//   gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}

var g_last = Date.now();
function animate(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
  // Set the rotation matrix
  modelMatrix.setTranslate(0.5, -0.5, 0);
  modelMatrix.rotate(currentAngle, 0, 0, 1);
  modelMatrix.scale(0.5, 0.5, 1);

  // Pass the rotation matrix to the vertex shader
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.2, 0.3, 0.3, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}