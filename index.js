import mjml2html from 'mjml'

const options = {
 //   filePath: './src/index.mjml',
    beautify: true,
    minify: true,
    validationLevel: 'strict'
}
 
/*
  Compile an mjml string
*/
const htmlOutput = mjml2html(`
  <mjml>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text>
            Hello World!
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`, options)


/*
  Print the responsive HTML generated and MJML errors if any
*/
console.log(htmlOutput)
