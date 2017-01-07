app.controller('AppCtrl', ['$scope', '$cookies', '$http', '$mdDialog', '$mdSidenav', 'SignUp', 'Account', 'Projects', 'Tasks', 'Task', 'Project',
    function ($scope, $cookies, $http, $mdDialog, $mdSidenav, SignUp, Account, Projects, Tasks, Task, Project) {

        $scope.session = $cookies.get('userSession');
        $scope.username = null;
        $scope.accountImageUrl = null;
        $scope.projects = [];
        $scope.searchQuery = '';
        $scope.totalCount = 0;
        $scope.currentProject = null;
        $scope.currentTask = null;
        $scope.tasks = [];
        $scope.sortTasks = [];
        $scope.loading = true;

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
            $scope.loading = true;
            Projects.fetch({session: $scope.session}, function (data) {
                $scope.projects = removeNesting(data.projects, 'Project');
                if (!$scope.currentProject) {
                    $scope.currentProject = $scope.projects[0];
                }
                console.log($scope.currentProject);
                $scope.updateTasks();
            });
        };

        $scope.updateTasks = function () {
            $scope.loading = true;
            Tasks.fetch({
                session: $scope.session,
                project_id: $scope.currentProject.id,
                condition_keywords: $scope.searchQuery,
                paging_size: $scope.tasks.length < PAGING_SIZE ? PAGING_SIZE : $scope.tasks.length,
                paging_offset: BEGIN_PAGING_OFFSET
            }, function (data) {
                $scope.totalCount = data.total_count;
                $scope.tasks = removeNesting(data.tasks, 'Task');
                $scope.loading = false;
            });
        };

        $scope.loadNewTasks = function () {
            $scope.loading = true;
            Tasks.fetch({
                session: $scope.session,
                project_id: $scope.currentProject.id,
                paging_size: PAGING_SIZE,
                paging_offset: $scope.tasks.length
            }, function (data) {
                $scope.tasks = $scope.tasks.concat(removeNesting(data.tasks, 'Task'));
                $scope.loading = false;
            });
        };

        $scope.chooseProject = function (project) {
            $scope.currentProject = project;
        };

        $scope.createTask = function (taskName, taskDescription) {
            $scope.loading = true;
            Task.create({}, {
                session: $scope.session,
                Project: {
                    id: $scope.currentProject.id
                },
                Task: {
                    title: taskName,
                    description: taskDescription
                }
            }, function () {
                $scope.currentProject.task_count = +$scope.currentProject.task_count + 1;
                $scope.updateTasks();
            });
        };

        $scope.removeTask = function (task) {
            $scope.loading = true;
            $mdSidenav('task-description').close();
            Task.remove({session: $scope.session, task_id: task.id}, function () {
                $scope.currentProject.task_count = $scope.currentProject.task_count - 1;
                $scope.updateTasks();
            });
        };

        $scope.createProject = function (projectName) {
            $scope.loading = true;
            Project.create({}, {
                'session': $scope.session,
                'Project': {
                    'title': projectName
                }
            }, function () {
                $scope.updateProjects();
            });
        };

        $scope.removeProject = function () {
            $scope.loading = true;
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

        $scope.editProject = function (projectName) {
            $scope.loading = true;
            Project.update({}, {
                session: $scope.session,
                Project: {
                    id: $scope.currentProject.id,
                    title: projectName
                }
            }, function (data) {
                $scope.currentProject = data.Project;
                $scope.updateProjects();
            });
        };

        $scope.editTask = function (taskName, taskDescription) {
            $scope.loading = true;
            Task.update({}, {
                session: $scope.session,
                Task: {
                    id: $scope.currentTask.id,
                    title: taskName,
                    description: taskDescription
                }
            }, function (data) {
                $scope.currentTask = data.Task;
                $scope.updateTasks();
            });
        };

        $scope.openTaskDescription = function (task) {
            $scope.currentTask = task;
            $mdSidenav('task-description').open();
        };

        $scope.closeTaskDescription = function () {
            $mdSidenav('task-description').close();
        };

        $scope.openCreateTask = function () {
            $mdSidenav('create-task').open();
        };

        $scope.saveCreateTask = function (taskName, description) {
            if (taskName && description) {
                $scope.createTask(taskName, description);
                $mdSidenav('create-task').close();
                $scope.taskNameValueCreate = null;
                $scope.descriptionValueCreate = null;
            }
        };

        $scope.closeCreateTask = function () {
            $mdSidenav('create-task').close();
        };

        $scope.openCreateProject = function () {
            $mdSidenav('create-project').open();
        };

        $scope.saveProjectCreate = function (projectName) {
            if (projectName) {
                $scope.createProject(projectName);
                $mdSidenav('create-project').close();
                $scope.projectNameValue = null;
            }
        };

        $scope.closeCreateProject = function () {
            $mdSidenav('create-project').close();
        };

        $scope.openEditProject = function () {
            $mdSidenav('edit-project').open();
        };


        $scope.saveProjectEdit = function (projectName) {
            if (projectName) {
                $scope.editProject(projectName);
                $mdSidenav('edit-project').close();
            }
        };

        $scope.closeEditProject = function () {
            $mdSidenav('edit-project').close();
        };

        $scope.openEditTask = function () {
            $mdSidenav('task-description').close();
            $mdSidenav('edit-task').open();
        };

        $scope.saveEditTask = function (taskName, taskDescription) {
            if (taskName && taskDescription) {
                $scope.editTask(taskName, taskDescription);
                $mdSidenav('edit-task').close();
            }
        };

        $scope.closeEditTask = function () {
            $mdSidenav('edit-task').close();
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
