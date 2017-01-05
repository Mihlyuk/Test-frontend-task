app.controller('AppCtrl', ['$scope', '$cookies', '$http', '$mdDialog', 'SignUp', 'Account', 'Projects', 'Tasks', 'Task', 'Project',
    function ($scope, $cookies, $http, $mdDialog, SignUp, Account, Projects, Tasks, Task, Project) {
        $scope.session = $cookies.get('userSession');
        $scope.username = null;
        $scope.accountImageUrl = null;
        $scope.projects = [];
        $scope.searchQuery = '';
        $scope.totalCount = 0;
        $scope.currentProject = null;
        $scope.tasks = [];
        $scope.sortTasks = [];

        $scope.$watch('tasks', function () {
            $scope.sortTasks = sortByDate($scope.tasks);
        });

        $scope.$watch('currentProject', function () {
            if ($scope.currentProject) {
                $scope.updateTasks();
            }
        });

        $scope.updateAccount = function () {
            Account.fetch({session: $scope.session}, function (data) {
                var account = data.Account;

                $scope.username = account.username;
                $scope.accountImageUrl = account.image_url;
            });
        };

        $scope.updateProjects = function () {
            Projects.fetch({session: $scope.session}, function (data) {
                $scope.projects = removeNesting(data.projects, 'Project');
                if (!$scope.currentProject) {
                    $scope.currentProject = $scope.projects[0];
                }
                $scope.updateTasks();
            });
        };

        $scope.updateTasks = function () {
            Tasks.fetch({
                session: $scope.session,
                project_id: $scope.currentProject.id,
                condition_keywords: $scope.searchQuery,
                paging_size: $scope.tasks.length < PAGING_SIZE ? PAGING_SIZE : $scope.tasks.length,
                paging_offset: BEGIN_PAGING_OFFSET
            }, function (data) {
                $scope.totalCount = data.total_count;
                $scope.tasks = removeNesting(data.tasks, 'Task');
            });
        };

        $scope.loadNewTasks = function () {
            Tasks.fetch({
                session: $scope.session,
                project_id: $scope.currentProject.id,
                paging_size: PAGING_SIZE,
                paging_offset: $scope.tasks.length
            }, function (data) {
                $scope.tasks = $scope.tasks.concat(removeNesting(data.tasks, 'Task'));
            });
        };

        $scope.chooseProject = function (project) {
            $scope.currentProject = project;
        };

        $scope.createTask = function (event) {
            var confirm = $mdDialog.prompt()
                .title('Input please task name')
                .placeholder('Task name')
                .ariaLabel('Task name')
                .targetEvent(event)
                .ok('Create')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function (taskName) {
                Task.create({}, {
                    session: $scope.session,
                    Project: {
                        id: $scope.currentProject.id
                    },
                    Task: {
                        title: taskName,
                        description: EXAMPLE_DESCRIPTION
                    }
                }, function () {
                    $scope.currentProject.task_count = +$scope.currentProject.task_count + 1;
                    $scope.updateTasks();
                });
            });
        };

        $scope.removeTask = function (task) {
            Task.remove({session: $scope.session, task_id: task.id}, function () {
                $scope.currentProject.task_count = $scope.currentProject.task_count - 1;
                $scope.updateTasks();
            });
        };

        $scope.createProject = function (event) {
            var confirm = $mdDialog.prompt()
                .title('Input please project name')
                .placeholder('Project name')
                .ariaLabel('Project name')
                .targetEvent(event)
                .ok('Create')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function (result) {
                Project.create({}, {
                    'session': $scope.session,
                    'Project': {
                        'title': result
                    }
                }, function () {
                    $scope.updateProjects();
                });
            });
        };

        $scope.removeProject = function () {
            Project.delete({session: $scope.session, project_id: $scope.currentProject.id}, function () {
                $scope.currentProject = null;
                $scope.updateProjects();
            });
        };

        $scope.relativeDate = function (date) {
            return moment(date).format(TASK_DATE_FORMAT);
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
                Project.update({}, {
                    session: $scope.session,
                    Project: {
                        id: $scope.currentProject.id,
                        title: result
                    }
                }, function (data) {
                    $scope.currentProject = data.Project;
                    $scope.updateProjects();
                });
            });
        };

        $scope.search = function () {
            $scope.updateTasks();
        };

        if (!$scope.session) {
            SignUp.createNewUser({}, function (data) {
                $cookies.put('userSession', data.session);
                $scope.session = data.session;
                $scope.updateAccount();
                $scope.updateProjects();
            });
        } else {
            $scope.updateAccount();
            $scope.updateProjects();
        }
    }]);
