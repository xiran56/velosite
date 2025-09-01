module.exports = function(jst_path, templates_data_path, output_dir) {
    var path = require('path')

    jst_path = path.join('..', jst_path)

    console.log(jst_path)
    console.log(templates_data_path)
    console.log(output_dir)

    var Handlebars = require('handlebars');
    var templates = require(jst_path)(Handlebars);
    var fs = require('fs');
    var path = require('path')

    var template_data = JSON.parse(fs.readFileSync(templates_data_path), 'utf8');

    for (var hbs_name in templates) {
        if (!templates.hasOwnProperty(hbs_name))
            continue;

        html_name = path.join(output_dir, hbs_name.substring(hbs_name.lastIndexOf('/')+1, hbs_name.length - 4) + '.html');
        html_string = templates[hbs_name](template_data);
        fs.writeFileSync(html_name, html_string, 'utf8');
    }
}
