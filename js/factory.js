app.factory('SignUp', ['$resource', function ($resource) {
    return $resource(API + 'signup', {}, {
        createNewUser: {
            method: 'POST',
            params: {}
        }
    });
}]);

app.factory('Session', ['$resource', function ($resource) {
    return $resource('')
}]);

app.factory('Account', ['$resource', function ($resource) {
    return $resource(API + 'account', {
        session: '@session'
    }, {
        fetch: {
            method: 'GET',
            params: {
                session: '@session'
            }
        }
    })
}]);

app.factory('Projects', ['$resource', function ($resource) {
    return $resource(API + 'projects', {
        session: '@session'
    }, {
        fetch: {
            method: 'GET',
            params: {
                session: '@session'
            }
        }
    })
}]);

app.factory('Project', ['$resource', function ($resource) {
    return $resource(API + 'projects/project', {}, {
        fetch: {
            method: 'GET',
            params: {
                session: '@session',
                project_id: '@project_id'
            }
        },
        update: {
            method: 'POST'
        },
        create: {
            method: 'POST'
        },
        remove: {
            method: 'DELETE',
            params: {
                session: '@session',
                project_id: '@project_id'
            }
        }
    })
}]);

app.factory('Tasks', ['$resource', function ($resource) {
    return $resource(API + 'tasks', {}, {
        fetch: {
            method: 'GET',
            params: {
                session: '@session',
                projectId: '@project_id',
                paging_size: '@paging_size',
                paging_offset: '@paging_offset'
            }
        },

        fetchWithCondition: {
            method: 'GET', params: {
                session: '@session',
                projectId: '@projectId',
                conditionKeywords: '@conditionKeywords',
                pagingSize: '@pagingSize',
                pagingOffset: '@pagingOffset'
            }
        }

    })
}]);

app.factory('Task', ['$resource', function ($resource) {
    return $resource(API + 'tasks/task', {}, {
        create: {
            method: 'POST'
        },
        remove: {
            method: 'DELETE',
            params: {
                session: '@session',
                task_id: '@task_id'
            }
        },
        update: {
            method: 'POST'
        }
    })
}]);
