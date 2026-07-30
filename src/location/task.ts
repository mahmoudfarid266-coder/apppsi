import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { GEOFENCE_TASK, onRegionEvent } from './geofence';

/**
 * Registers the geofence task. MUST be imported at module scope, before any
 * call to Location.startGeofencingAsync — otherwise that call throws
 * "Task not found".
 *
 * This runs OS-managed region monitoring only. There is no background location
 * task and no continuous positioning (Principle XII, NFR-7).
 */
if (!TaskManager.isTaskDefined(GEOFENCE_TASK)) {
  TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
    if (error) return;
    const payload = data as {
      eventType: Location.GeofencingEventType;
      region: Location.LocationRegion;
    };
    const id = payload.region?.identifier;
    if (!id) return;
    await onRegionEvent(id, payload.eventType === Location.GeofencingEventType.Enter);
  });
}

export {};
