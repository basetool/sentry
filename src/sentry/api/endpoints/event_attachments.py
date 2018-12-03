from __future__ import absolute_import

from datetime import timedelta
from django.utils import timezone

from sentry import features, quotas
from sentry.api.bases.project import ProjectEndpoint
from sentry.api.paginator import OffsetPaginator
from sentry.api.serializers import serialize
from sentry.models import Event, EventAttachment


class EventAttachmentsEndpoint(ProjectEndpoint):
    def get(self, request, project, event_id):
        """
        Retrieve attachments for an event
        `````````````````````````````````

        :pparam string organization_slug: the slug of the organization the
                                          issues belong to.
        :pparam string project_slug: the slug of the project the event
                                     belongs to.
        :pparam string event_id: the id of the event.
        :auth: required
        """
        if not features.has('organizations:event-attachments',
                            project.organization, actor=request.user):
            return self.respond(status=404)

        try:
            event = Event.objects.get(
                id=event_id,
                project_id=project.id,
            )
        except Event.DoesNotExist:
            return self.respond({'detail': 'Event not found'}, status=404)

        queryset = EventAttachment.objects.filter(
            project_id=project.id,
            event_id=event.event_id,
        ).select_related('file')

        retention = quotas.get_attachment_retention(organization=project.organization)
        if retention:
            queryset = queryset.filter(
                date_added__gte=timezone.now() - timedelta(days=retention)
            )

        return self.paginate(
            request=request,
            queryset=queryset,
            order_by='name',
            on_results=lambda x: serialize(x, request.user),
            paginator_cls=OffsetPaginator,
        )
