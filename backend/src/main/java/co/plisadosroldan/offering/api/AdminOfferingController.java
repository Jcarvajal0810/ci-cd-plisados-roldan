package co.plisadosroldan.offering.api;

import co.plisadosroldan.offering.application.OfferingCommands;
import co.plisadosroldan.offering.application.OfferingQueries;
import co.plisadosroldan.offering.domain.Offering;
import co.plisadosroldan.shared.api.OrderRequest;
import co.plisadosroldan.shared.api.PublicationRequest;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/admin/offerings")
class AdminOfferingController {

  private final OfferingQueries queries;
  private final OfferingCommands commands;

  AdminOfferingController(OfferingQueries queries, OfferingCommands commands) {
    this.queries = queries;
    this.commands = commands;
  }

  @GetMapping
  List<AdminOfferingResponse> list() {
    return queries.all().stream().map(AdminOfferingResponse::from).toList();
  }

  @PostMapping
  ResponseEntity<AdminOfferingResponse> create(@Valid @RequestBody OfferingInputRequest body) {
    Offering created = commands.create(body.toContent());
    URI location =
        ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.id())
            .toUri();
    return ResponseEntity.created(location).body(AdminOfferingResponse.from(created));
  }

  @PutMapping("/order")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void reorder(@Valid @RequestBody OrderRequest body) {
    commands.reorder(body.ids());
  }

  @GetMapping("/{id}")
  AdminOfferingResponse get(@PathVariable long id) {
    return AdminOfferingResponse.from(queries.byId(id));
  }

  @PutMapping("/{id}")
  AdminOfferingResponse update(
      @PathVariable long id, @Valid @RequestBody OfferingInputRequest body) {
    return AdminOfferingResponse.from(commands.update(id, body.toContent()));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void delete(@PathVariable long id) {
    commands.delete(id);
  }

  @PutMapping("/{id}/publication")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void publication(@PathVariable long id, @Valid @RequestBody PublicationRequest body) {
    commands.setPublished(id, body.published());
  }
}
