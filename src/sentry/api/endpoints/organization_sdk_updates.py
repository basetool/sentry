from __future__ import absolute_import

from itertools import groupby, chain
from datetime import timedelta

from packaging import version
from django.utils import timezone
from rest_framework.response import Response
from sentry.api.serializers.base import serialize

from sentry.sdk_updates import SdkIndexState, SdkSetupState, get_suggested_updates
from sentry.api.bases import OrganizationEventsEndpointBase
from sentry.utils.compat import map
from sentry.snuba import discover


def by_sdk_name(sdk):
    return sdk["sdk.name"]


def by_project_id(sdk):
    return sdk["project.id"]


def serialize(data, projects):
    # Build datastructure of the latest version of each SDK in use for each
    # project we have events for.
    sdks_by_project = [
        (
            project_id,
            [
                {
                    "name": sdk_name,
                    "version": sorted((s["sdk.version"] for s in sdks), key=version.Version).pop(),
                }
                for sdk_name, sdks in groupby(sorted(sdks_used, key=by_sdk_name), key=by_sdk_name)
            ],
        )
        for project_id, sdks_used in groupby(data, key=by_project_id)
    ]
    sdks_by_project = dict(sdks_by_project)

    # Determine suggested upgrades for each project
    index_state = SdkIndexState()

    return {
        project.id: list(
            chain.from_iterable(
                map(
                    lambda sdk: get_suggested_updates(
                        # TODO: In the future it would be nice to also add
                        # the integrations and modules the SDK is using.
                        # However this isn't currently available in the
                        # discover dataset from snuba.
                        SdkSetupState(sdk["name"], sdk["version"], (), ()),
                        index_state,
                    ),
                    sdks_by_project.get(project.id, []),
                )
            )
        )
        for project in projects
    }


class OrganizationSdkUpdatesEndpoint(OrganizationEventsEndpointBase):
    def get(self, request, organization):

        project_ids = self.get_requested_project_ids(request)
        projects = self.get_projects(request, organization, project_ids)

        with self.handle_query_errors():
            result = discover.query(
                query="has:sdk.version",
                selected_columns=["project", "sdk.name", "sdk.version", "last_seen()"],
                orderby="-project",
                params={
                    "start": timezone.now() - timedelta(days=1),
                    "end": timezone.now(),
                    "organization_id": organization.id,
                    "project_id": [p.id for p in projects],
                },
                referrer="api.organization-sdk-updates",
            )

        return Response(serialize(result["data"], projects))
