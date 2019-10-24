var COLOR_VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  "uniform mat4 u_MvpMatrix;\n" +
  "void main() {\n" +
  "  gl_Position = u_MvpMatrix * a_Position;\n" +
  "}\n";

// Fragment shader program
var COLOR_FSHADER_SOURCE =
  "#ifdef GL_ES\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "uniform vec4 u_ObjColor;\n" +
  "uniform vec4 u_LightColor;\n" +
  "void main() {\n" +
  "  gl_FragColor = u_LightColor * u_ObjColor ;\n" +
  "}\n";

var LAMP_VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  "uniform mat4 u_MvpMatrix;\n" +
  "void main() {\n" +
  "  gl_Position = u_MvpMatrix * a_Position;\n" +
  "}\n";

var LAMP_FSHADER_SOURCE =
  "#ifdef GL_ES\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "uniform vec4 u_LightColor;\n" +
  "void main() {\n" +
  "  gl_FragColor = u_LightColor;\n" +
  "}\n";

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  //Create shaders
  var colorProgram = createProgram(
    gl,
    COLOR_VSHADER_SOURCE,
    COLOR_FSHADER_SOURCE
  );

  var lampProgram = createProgram(
    gl,
    LAMP_VSHADER_SOURCE,
    LAMP_FSHADER_SOURCE
  );

  var vertices = new Float32Array([
    -0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,

    -0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,

    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    0.5,
    0.5,

    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    0.5,
    0.5,

    -0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    -0.5,

    -0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    -0.5
  ]);


  // Specify the color for clearing <canvas>
  gl.clearColor(0.1, 0.1, 0.1, 1);
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  //使用colorProgram
  gl.useProgram(colorProgram);
  gl.program = colorProgram;

  // Write the positions of vertices to a vertex shader
  var n = initVertexBuffers(gl , vertices);
  if (n < 0) {
    console.log("Failed to set the positions of the vertices");
    return;
  }

  var colorModelMatrix = new Matrix4();
  var lampModelMatrix = new Matrix4();
  var viewMatrix = new Matrix4();
  var prespectiveMatrix = new Matrix4();
  var colorMvpMatrix = new Matrix4();
  var lampMvpMatrix = new Matrix4();

  viewMatrix.setLookAt(5, 0, 10, 0, 0, 0, 0, 1, 0);
  prespectiveMatrix.setPerspective(45.0, canvas.width / canvas.height, 1, 100);
  lampModelMatrix.setTranslate(1.2, 1.0, 2.0);
  lampModelMatrix.scale(0.2, 0.2, 0.2);
  lampMvpMatrix
    .set(prespectiveMatrix)
    .multiply(viewMatrix)
    .multiply(lampModelMatrix);
  colorMvpMatrix
    .set(prespectiveMatrix)
    .multiply(viewMatrix)
    .multiply(colorModelMatrix);

  var u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");
  gl.uniformMatrix4fv(u_MvpMatrix, false, colorMvpMatrix.elements);

  var u_ObjColor = gl.getUniformLocation(gl.program, "u_ObjColor");
  gl.uniform4f(u_ObjColor, 1.0, 0.5, 0.31, 1);

  var u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
  gl.uniform4f(u_LightColor, 1.0, 1.0, 1.0, 1);

  gl.drawArrays(gl.TRIANGLES, 0, n);

  gl.useProgram(lampProgram);
  gl.program = lampProgram;

  n = initVertexBuffers(gl);
  if (n < 0) {
    console.log("Failed to set the positions of the vertices");
    return;
  }

  var u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
  gl.uniform4f(u_LightColor, 1.0, 1.0, 1.0, 1);

  var u_LampMvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");
  gl.uniformMatrix4fv(u_LampMvpMatrix, false, lampMvpMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl , vertices) {


  var n = 36; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return -1;
  }

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  return n;
}
