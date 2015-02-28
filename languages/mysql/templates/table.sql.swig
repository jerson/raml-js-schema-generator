DROP TABLE IF EXISTS `{{ name }}`;

CREATE TABLE `{{ name }}` (
{% for propertyName,property in schema.properties %}
    `{{ propertyName }}` {{ (property | parseType(schemas)) | raw }}{% if (propertyName | isRequired(schema)) %} NOT NULL {% endif %}{% if property.default %} DEFAULT '{{ property.default }}'{% elseif (property | isIdentity) %} AUTO_INCREMENT {% endif %}{% if not loop.last %},{% endif %}
{% endfor %}
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


{{ (schema | uniqueKeys(name)) | raw }}
{{ (schema | primaryKeys(name)) | raw }}
{{ (schema | foreignKeys(name,schemas)) | raw }}

