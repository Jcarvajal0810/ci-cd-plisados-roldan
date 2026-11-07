package co.plisadosroldan.testimonial.api;

import co.plisadosroldan.media.api.ImageResponse;
import co.plisadosroldan.media.api.ImageUploads;
import co.plisadosroldan.shared.api.OrderRequest;
import co.plisadosroldan.shared.api.PublicationRequest;
import co.plisadosroldan.testimonial.application.TestimonialCommands;
import co.plisadosroldan.testimonial.application.TestimonialQueries;
import co.plisadosroldan.testimonial.domain.Testimonial;
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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/admin/testimonials")
class AdminTestimonialController {

  private final TestimonialQueries queries;
  private final TestimonialCommands commands;

  AdminTestimonialController(TestimonialQueries queries, TestimonialCommands commands) {
    this.queries = queries;
    this.commands = commands;
  }

  @GetMapping
  List<AdminTestimonialResponse> list() {
    return queries.all().stream().map(AdminTestimonialResponse::from).toList();
  }

  @PostMapping
  ResponseEntity<AdminTestimonialResponse> create(
      @Valid @RequestBody TestimonialInputRequest body) {
    Testimonial created = commands.create(body.toContent());
    URI location =
        ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.id())
            .toUri();
    return ResponseEntity.created(location).body(AdminTestimonialResponse.from(created));
  }

  @PutMapping("/order")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void reorder(@Valid @RequestBody OrderRequest body) {
    commands.reorder(body.ids());
  }

  @GetMapping("/{id}")
  AdminTestimonialResponse get(@PathVariable long id) {
    return AdminTestimonialResponse.from(queries.byId(id));
  }

  @PutMapping("/{id}")
  AdminTestimonialResponse update(
      @PathVariable long id, @Valid @RequestBody TestimonialInputRequest body) {
    return AdminTestimonialResponse.from(commands.update(id, body.toContent()));
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

  @PutMapping("/{id}/photo")
  ImageResponse setPhoto(@PathVariable long id, @RequestPart("file") MultipartFile file) {
    String name = queries.byId(id).clientName();
    return ImageResponse.from(commands.setPhoto(id, ImageUploads.from(file, null)), name);
  }

  @DeleteMapping("/{id}/photo")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void removePhoto(@PathVariable long id) {
    commands.removePhoto(id);
  }
}
