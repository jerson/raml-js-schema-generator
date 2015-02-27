DROP TABLE IF EXISTS `{{ name }}`;

CREATE TABLE `{{ name }}` (
{% for propertyName,property in schema.properties %}
    `{{ propertyName }}` {{ (property | parseType(schemas)) | raw }}{% if (propertyName | isRequired(schema)) %} NOT NULL {% endif %}{% if property.default %} DEFAULT '{{ property.default }}'{% elseif (property | isIdentity) %} AUTO_INCREMENT {% endif %}{% if not loop.last %},{% endif %}
{% endfor %}
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


{{ (schema.properties | uniqueKeys(name)) | raw }}
{{ (schema.properties | primaryKeys(name)) | raw }}
{{ (schema.properties | foreignKeys(name,schemas)) | raw }}

