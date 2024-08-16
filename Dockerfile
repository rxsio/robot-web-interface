FROM ubuntu:23.04

# region Install dependencies

    # Update repository
RUN apt-get update

    # Install dependencies
RUN apt-get install -y python3 python3-venv

# endregion

# region Copy solution

    # Copy
WORKDIR /robot-web-interface
COPY server ./server/
COPY dist ./dist

# endregion

# region Copy scripts

    # Copy
WORKDIR /robot-web-interface/server
RUN chmod +x ./scripts/*.sh

# endregion

# region Setup server environment

    # Setup server
RUN ./scripts/setupServer.sh

# endregion

CMD ["./scripts/run.sh"]