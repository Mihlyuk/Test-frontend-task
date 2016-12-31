const SIGN_UP = 'https://api-test-task.decodeapps.io/signup?New%20item=';
const PAGING_SIZE = 5;

angular.module('testApp', ['ngMaterial', 'ngCookies'])
    .controller('AppCtrl', ['$scope', '$cookies', '$http', '$mdDialog', function ($scope, $cookies, $http, $mdDialog) {
        if (!$cookies.get('userSession')) {
            $http.post(SIGN_UP)
                .then(function (response) {
                    var data = response.data;
                    $cookies.put('userSession', data.session);
                })
                .then(function () {
                    var session = $cookies.get('userSession');

                    $http.get('https://api-test-task.decodeapps.io/account?session=' + session).then(function (response) {
                        var account = response.data.Account;
                        $scope.username = account.username;
                        $scope.imageUrl = account.image_url;
                    });

                    $http.get('https://api-test-task.decodeapps.io/projects?session=' + session).then(function (response) {
                        $scope.projects = response.data.projects.map(function (project) {
                            return project.Project;
                        })
                    }).then(function () {
                        var firstProject = $scope.projects[0];
                        $scope.currentProject = firstProject;
                        var url = 'https://api-test-task.decodeapps.io/tasks?session=' + session +
                            '&project_id=' + firstProject.id + '&paging_size=' + PAGING_SIZE + '&paging_offset=0';

                        $http.get(url).then(function (response) {
                            $scope.offset = 0;
                            $scope.total_count = response.data.total_count;
                            $scope.tasks = response.data.tasks.map(function (task) {
                                task.Task.fromNow = moment(task.Task.created_at).format('dddd (DD.MM.YYYY)');
                                return task.Task;
                            });
                            $scope.tasks = task_sort($scope.tasks);
                        })
                    });
                });
        } else {
            var session = $cookies.get('userSession');

            $http.get('https://api-test-task.decodeapps.io/account?session=' + session).then(function (response) {
                var account = response.data.Account;
                $scope.username = account.username;
                $scope.imageUrl = account.image_url;
            });

            $http.get('https://api-test-task.decodeapps.io/projects?session=' + session).then(function (response) {
                $scope.projects = response.data.projects.map(function (project) {
                    return project.Project;
                })
            }).then(function () {
                var firstProject = $scope.projects[0];
                $scope.currentProject = firstProject;
                var url = 'https://api-test-task.decodeapps.io/tasks?session=' + session +
                    '&project_id=' + firstProject.id + '&paging_size=' + PAGING_SIZE + '&paging_offset=0';

                $http.get(url).then(function (response) {
                    $scope.offset = 0;
                    $scope.total_count = response.data.total_count;
                    $scope.tasks = response.data.tasks.map(function (task) {
                        task.Task.fromNow = moment(task.Task.created_at).format('dddd (DD.MM.YYYY)');
                        return task.Task;
                    });
                    $scope.tasks = task_sort($scope.tasks);
                })
            });
//////////////////////////////////////////////////////////
            $scope.chooseProject = function (project) {
                $scope.currentProject = project;
                var url = 'https://api-test-task.decodeapps.io/tasks?session=' + session +
                    '&project_id=' + project.id + '&paging_size=' + PAGING_SIZE + '&paging_offset=0';

                $http.get(url).then(function (response) {
                    $scope.offset = 0;
                    $scope.total_count = response.data.total_count;
                    $scope.tasks = response.data.tasks.map(function (task) {
                        task.Task.fromNow = moment(task.Task.created_at).format('dddd (DD.MM.YYYY)');
                        return task.Task;
                    });
                    $scope.tasks = task_sort($scope.tasks);
                });
            };
////////////////////////////////////////////////////
            $scope.pagination = function () {
                var total = $scope.total_count;
                var offset = $scope.offset + PAGING_SIZE;
                var paging_size = total - (PAGING_SIZE * offset) > PAGING_SIZE ? PAGING_SIZE : total - (PAGING_SIZE * offset);

                var url = 'https://api-test-task.decodeapps.io/tasks?session=' + session +
                    '&project_id=' + $scope.currentProject.id + '&paging_size=' + paging_size + '&paging_offset=' + offset;

                $http.get(url).then(function (response) {
                    var tasks = response.data.tasks;

                    $scope.total_count = response.data.total_count;
                    tasks.forEach(function (task) {
                        task.Task.fromNow = moment(task.Task.created_at).format('dddd (DD.MM.YYYY)');
                        $scope.tasks = addTaskToEnd($scope.tasks, task.Task);
                    });
                });
            };
////////////////////////////////////////////////
            $scope.addTask = function (event) {
                var confirm = $mdDialog.prompt()
                    .title('Input please task name')
                    .placeholder('Task name')
                    .ariaLabel('Task name')
                    .targetEvent(event)
                    .ok('Create')
                    .cancel('Cancel');

                $mdDialog.show(confirm).then(function (result) {
                    var currentProject = $scope.currentProject,
                        session = $cookies.get('userSession'),
                        url = 'https://api-test-task.decodeapps.io/tasks/task',
                        data = {
                            'session': session,
                            'Project': {
                                'id': currentProject.id
                            },
                            'Task': {
                                'title': result
                            }
                        };

                    $http.post(url, data).then(function (response) {
                        var taskId = response.data.Task.id;

                        $http.get('https://api-test-task.decodeapps.io/tasks/task?session=' + session + '&task_id=' + taskId).then(function (responce) {
                            var newTask = responce.data.Task;

                            newTask.fromNow = moment(newTask.created_at).format('dddd (DD.MM.YYYY)');

                            $scope.tasks = addTask($scope.tasks, newTask);
                            $scope.total_count += 1;
                            $scope.currentProject.task_count = +$scope.currentProject.task_count + 1;

                        });
                    });
                });
            };
        }
////////////////////////////////////////////
        $scope.removeTask = function (task) {
            var session = $cookies.get('userSession'),
                task_id = task.id,
                url = 'https://api-test-task.decodeapps.io/tasks/task?session=' + session + '&task_id=' + task_id;

            $http.delete(url).then(function (result) {

                $scope.tasks = $scope.tasks.map(function (task_group) {
                    return task_group.filter(function (task) {
                        return task.id != task_id;
                    });
                });
                $scope.total_count -= 1;
                $scope.currentProject.task_count = $scope.currentProject.task_count - 1;
            });
        };
////////////////////////////////////////////
        $scope.addProject = function (event) {
            debugger;
            var confirm = $mdDialog.prompt()
                .title('Input please project name')
                .placeholder('Project name')
                .ariaLabel('Project name')
                .targetEvent(event)
                .ok('Create')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function (result) {
                var session = $cookies.get('userSession'),
                    url = 'https://api-test-task.decodeapps.io/projects/project',
                    data = {
                        'session': session,
                        'Project': {
                            'title': result
                        }
                    };

                $http.post(url, data).then(function (response) {
                    var taskId = response.data.Project.id,
                        newProject = {
                            id: taskId,
                            task_count: 0,
                            title: result
                        };
                    $scope.projects.unshift(newProject);
                    $scope.total_count += 1;
                });
            });
        };
/////////////////////////////////////////////////////
        $scope.removeProject = function () {
            var project = $scope.currentProject,
                session = $cookies.get('userSession'),
                url = 'https://api-test-task.decodeapps.io/projects/project?session=' + session + '&project_id=' + project.id;

            $http.delete(url).then(function (result) {
                var removedProjectId = project.id;

                $scope.projects = $scope.projects.filter(function (project) {
                    return removedProjectId != project.id;
                });

                $scope.currentProject = $scope.projects[0];
                var url = 'https://api-test-task.decodeapps.io/tasks?session=' + session +
                    '&project_id=' + $scope.currentProject.id + '&paging_size=5&paging_offset=0';

                $http.get(url).then(function (response) {
                    $scope.offset = 0;
                    $scope.tasks = response.data.tasks.map(function (task) {
                        return task.Task;
                    });
                });
            });
        };

        $scope.openMenu = function ($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
        };

        $scope.editProject = function (event) {
            var confirm = $mdDialog.prompt()
                .title('Edit project name')
                .placeholder('Project name')
                .initialValue($scope.currentProject.title)
                .ariaLabel('Project name')
                .targetEvent(event)
                .ok('Save')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function (result) {
                var session = $cookies.get('userSession'),
                    url = 'https://api-test-task.decodeapps.io/projects/project',
                    data = {
                        session: session,
                        Project: {
                            id: $scope.currentProject.id,
                            title: result
                        }
                    };

                $http.post(url, data).then(function (result) {
                    var newProject = result.data.Project;

                    $scope.currentProject = newProject;
                    $scope.projects = $scope.projects.map(function (project) {
                        return project.id == newProject.id ? newProject : project;
                    });
                });
            });
        };

        $scope.search = function () {
            var session = $cookies.get('userSession'),
                url = 'https://api-test-task.decodeapps.io/tasks?session=' + session +
                    '&project_id=' + $scope.currentProject.id + '&paging_size=5&paging_offset=0&condition_keywords=' +
                    $scope.searchQuery;

            $http.get(url).then(function (response) {
                $scope.offset = 0;
                $scope.total_count = response.data.total_count;
                $scope.tasks = response.data.tasks.map(function (task) {
                    task.Task.fromNow = moment(task.Task.created_at).format('dddd (DD.MM.YYYY)');
                    return task.Task;
                });

                $scope.tasks = task_sort($scope.tasks);
            });

        };

        $scope.tasksLength = function () {
            var tasks = $scope.tasks;
            if (tasks) {
                return tasks.reduce(function (sum, a) {
                    return sum + a.length
                }, 0)
            }
        };
        console.log($cookies.get('userSession'));
    }]);

function task_sort(tasks) {
    var newTasks = [];
    var lastTask = null;

    tasks.forEach(function (task) {
        if (newTasks.length == 0) {
            newTasks.push([task]);
            lastTask = task;
            return;
        }

        var one = moment(task.created_at).isSame(moment(lastTask.created_at), 'day');
        var two = moment(task.created_at).isSame(moment(lastTask.created_at), 'month');
        var three = moment(task.created_at).isSame(moment(lastTask.created_at), 'year');

        if (one && two && three) {
            newTasks[newTasks.length - 1].push(task);
        } else {
            newTasks.push([task]);
        }

        lastTask = task;
    });

    return newTasks;
}


function addTask(tasks, task) {
    if (tasks.length == 0) {
        tasks.unshift([task]);
        return tasks;
    }

    var last_task = tasks[0][0];

    var one = moment(task.created_at).isSame(moment(last_task.created_at), 'day');
    var two = moment(task.created_at).isSame(moment(last_task.created_at), 'month');
    var three = moment(task.created_at).isSame(moment(last_task.created_at), 'year');

    if (one && two && three) {
        tasks[0].unshift(task);
    } else {
        tasks.unshift([task]);
    }

    return tasks;
}

function addTaskToEnd(tasks, task) {
    if (tasks.length == 0) {
        tasks.push([task]);
        return tasks;
    }

    var last_block = tasks[tasks.length - 1],
        last_task = last_block[last_block.length - 1];

    var one = moment(task.created_at).isSame(moment(last_task.created_at), 'day');
    var two = moment(task.created_at).isSame(moment(last_task.created_at), 'month');
    var three = moment(task.created_at).isSame(moment(last_task.created_at), 'year');

    if (one && two && three) {
        tasks[tasks.length - 1].push(task);
    } else {
        tasks.push([task]);
    }

    return tasks;
}