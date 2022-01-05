const mjml2html = require("mjml");

const options = {
    beautify: true,
    minify: true,
    validationLevel: 'strict'
}

/*
  Compile an mjml string
*/
const htmlOutput = mjml2html(`
<mjml>
    <mj-head>
        <mj-title>Test</mj-title>
    </mj-head>
    <mj-body>
        <mj-section>
            <mj-column>
                <mj-text>Test</mj-text>
            </mj-column>
        </mj-section>
    </mj-body>
</mjml>
`, options)


/*
  Print the responsive HTML generated and MJML errors if any
*/
console.log(htmlOutput)
