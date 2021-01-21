# -*- coding: utf-8 -*-
# Generated by Django 1.11.29 on 2020-07-28 22:38
from __future__ import unicode_literals

from django.db import migrations


# update the field with mutation
def convert_field(field):
    # even if async if false, we had a bug where we'd treat it the same as true
    # so to maintain legacy behavior, we have to replicate that same check when setting skip_load_on_open
    if "async" in field:
        field["skip_load_on_open"] = True
        del field["async"]


# updates the schema with mutation
def update_element_schema(schema):
    # update all the fields in the schema
    link = schema.get("link", {})
    create = schema.get("create", {})

    for field in link.get("required_fields", []):
        convert_field(field)

    for field in link.get("optional_fields", []):
        convert_field(field)

    for field in create.get("required_fields", []):
        convert_field(field)

    for field in create.get("optional_fields", []):
        convert_field(field)


def update_ui_components(apps, schema_editor):
    SentryAppComponent = apps.get_model("sentry", "SentryAppComponent")
    for component in SentryAppComponent.objects.filter(type="issue-link").select_related(
        "sentry_app"
    ):
        # need to update the denormalized data
        update_element_schema(component.schema)
        for element in component.sentry_app.schema.get("elements", []):
            # only update issue link elements
            if element.get("type") == "issue-link":
                update_element_schema(element)

        # save the UI component and the sentry app
        component.save()
        component.sentry_app.save()


class Migration(migrations.Migration):
    # This flag is used to mark that a migration shouldn't be automatically run in
    # production. We set this to True for operations that we think are risky and want
    # someone from ops to run manually and monitor.
    # General advice is that if in doubt, mark your migration as `is_dangerous`.
    # Some things you should always mark as dangerous:
    # - Large data migrations. Typically we want these to be run manually by ops so that
    #   they can be monitored. Since data migrations will now hold a transaction open
    #   this is even more important.
    # - Adding columns to highly active tables, even ones that are NULL.
    is_dangerous = False

    # This flag is used to decide whether to run this migration in a transaction or not.
    # By default we prefer to run in a transaction, but for migrations where you want
    # to `CREATE INDEX CONCURRENTLY` this needs to be set to False. Typically you'll
    # want to create an index concurrently when adding one to an existing table.
    atomic = False

    dependencies = [
        ("sentry", "0095_ruleactivity"),
    ]

    operations = [migrations.RunPython(update_ui_components, migrations.RunPython.noop)]
