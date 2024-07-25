/*
 * gstwebrtc-api
 *
 * Copyright (C) 2022 Igalia S.L. <info@igalia.com>
 *   Author: Loïc Le Page <llepage@igalia.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import 'webrtc-adapter'

import {
    createConsumerSession,
    getAvailableProducers,
    registerConnectionListener,
    registerProducersListener,
    SessionState,
    startGstreamerConnection,
    unregisterAllConnectionListeners,
    unregisterAllProducersListeners,
    unregisterConnectionListener,
    unregisterProducersListener,
} from './gstwebrtc-api'

export {
    SessionState,
    registerConnectionListener,
    unregisterConnectionListener,
    unregisterAllConnectionListeners,
    getAvailableProducers,
    registerProducersListener,
    unregisterProducersListener,
    unregisterAllProducersListeners,
    createConsumerSession,
    startGstreamerConnection,
}
