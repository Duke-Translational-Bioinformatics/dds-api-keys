#!/bin/bash
DIR="$(dirname ${BASH_SOURCE[0]})"
EXPECTED_PROJECT_VARIABLE_FILE="${DIR}/../../.ci/expected_project_variables"

raise()
{
  echo "${1}" >&2
}

check_project_repo_compatibility() {
  [ -f "${EXPECTED_PROJECT_VARIABLE_FILE}" ] && return
  raise "${EXPECTED_PROJECT_VARIABLE_FILE} is required"
  return 1
}

expected_project_variables() {
  grep -v '#' ${EXPECTED_PROJECT_VARIABLE_FILE} | cut -d':' -f1
}

check_required_environment() {
  local required_env="PROJECT_ACCESS_TOKEN GITLAB_URL"
  for reqvar in $required_env
  do
    if [ -z ${!reqvar} ]
    then
      raise "missing ENVIRONMENT ${reqvar}!"
      return 1
    fi
  done
}

get_project_environment() {
  local project_id="$(echo "${1}" | sed 's|/|%2F|g')"
  local project_variable_url="${GITLAB_URL}/api/v4/projects/${project_id}/variables"
  raise "getting environment from ${project_variable_url}"
  curl -L -H "PRIVATE-TOKEN: ${PROJECT_ACCESS_TOKEN}" "${project_variable_url}"
}

check_project_environment() {
  local project_id="${1}"
  local project_environment=$(get_project_environment "${project_id}")
  for required_project_environment in $(expected_project_variables)
  do
    echo "${project_environment}" | grep "${required_project_environment}" > /dev/null 2>&1
    if [ $? -gt 0 ]
    then
      raise "${required_project_environment} is missing!"
      return 1
    fi
  done
}

run_main() {
  local project_id="${1}"
  if [ -z "${project_id}" ]
  then
    raise "usage: ${0} project_id
  project_id can be an integer, or org/project
    "
    return 1
  fi
  check_project_repo_compatibility || return 1
  check_required_environment || return 1
  check_project_environment "${project_id}" || return
  raise "all required environment variables are present"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]
then
  run_main "${1}"
  if [ $? -gt 0 ]
  then
    exit 1
  fi
fi
